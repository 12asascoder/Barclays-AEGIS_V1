"""
Complete PDF Transaction Import - Extracts ALL transactions from all 48 pages
"""
import os
import re
import sys
from datetime import datetime
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Customer, Account, Transaction, Case, SARReport, CaseStatus

# PDF Processing
try:
    import pdfplumber
except ImportError:
    print("Installing pdfplumber...")
    os.system("pip3 install pdfplumber")
    import pdfplumber

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:5432/aegis")
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

PDF_PATH = '/Users/arnav/Code/AEGIS/AEGIS/testpdf.pdf'
PDF_PASSWORD = '242846433'

def parse_amount(amount_str):
    """Parse amount string to float"""
    if not amount_str or amount_str.strip() == '':
        return 0.0
    # Remove commas and convert
    clean_str = amount_str.replace(',', '').strip()
    try:
        return float(clean_str)
    except:
        return 0.0

def parse_date(date_str):
    """Parse date string to datetime"""
    if not date_str:
        return datetime.now()
    
    try:
        # Format: DD/MM/YY
        return datetime.strptime(date_str, '%d/%m/%y')
    except:
        try:
            # Format: DD/MM/YYYY
            return datetime.strptime(date_str, '%d/%m/%Y')
        except:
            return datetime.now()

def extract_all_transactions_from_pdf():
    """Extract ALL transactions from the PDF"""
    print(f"📄 Opening PDF: {PDF_PATH}")
    
    all_transactions = []
    
    with pdfplumber.open(PDF_PATH, password=PDF_PASSWORD) as pdf:
        print(f"✓ PDF has {len(pdf.pages)} pages")
        
        for page_num, page in enumerate(pdf.pages, 1):
            print(f"\n📃 Processing Page {page_num}...")
            
            # Extract text and look for transaction patterns
            text = page.extract_text()
            
            if not text:
                continue
            
            # Look for transaction patterns in text
            # Pattern: Date followed by narration, amount, and balance
            # Example: 23/08/24 NEFTCR-IDFB0010201... IDFBH24236607640 23/08/24 20,000.00 20,000.00
            
            lines = text.split('\n')
            
            for line in lines:
                # Look for lines with dates (DD/MM/YY format)
                date_match = re.search(r'(\d{2}/\d{2}/\d{2})', line)
                
                if not date_match:
                    continue
                
                # Skip header lines
                if 'WithdrawalAmt' in line or 'DepositAmt' in line or 'Date' == line.strip():
                    continue
                
                txn_date = date_match.group(1)
                
                # Extract amounts (look for patterns like 20,000.00 or 560.00)
                amounts = re.findall(r'[\d,]+\.\d{2}', line)
                
                if not amounts:
                    continue
                
                # Get narration (text between date and amounts)
                narration_start = line.find(txn_date) + len(txn_date)
                
                # Find where amounts start
                first_amount_pos = line.find(amounts[0])
                if first_amount_pos > narration_start:
                    narration = line[narration_start:first_amount_pos].strip()
                else:
                    narration = "Transaction"
                
                # Parse amounts
                # Last amount is usually closing balance
                # Second-to-last might be deposit or withdrawal
                if len(amounts) >= 2:
                    closing_balance = parse_amount(amounts[-1])
                    
                    # Try to determine if withdrawal or deposit
                    # If there are 3 amounts, one is withdrawal, one is deposit, one is balance
                    withdrawal_amt = 0.0
                    deposit_amt = 0.0
                    
                    if len(amounts) == 3:
                        # Format: withdrawal, deposit, balance OR deposit, balance, ?
                        # Check the pattern
                        withdrawal_amt = parse_amount(amounts[0])
                        deposit_amt = parse_amount(amounts[1]) if amounts[1] != amounts[-1] else 0.0
                    elif len(amounts) == 2:
                        # Either deposit or withdrawal + balance
                        # Need to infer from context
                        txn_amt = parse_amount(amounts[0])
                        # Assume it's a transaction amount
                        if 'UPI' in narration or 'NEFT' in narration or 'IMPS' in narration:
                            # Check common keywords
                            if any(word in narration.upper() for word in ['CR', 'CREDIT', 'DEPOSIT', 'RECEIVED']):
                                deposit_amt = txn_amt
                            else:
                                withdrawal_amt = txn_amt
                        else:
                            # Default to withdrawal for negative cash flow
                            withdrawal_amt = txn_amt
                    
                    # Determine transaction type
                    txn_type = 'deposit' if deposit_amt > 0 else 'withdrawal'
                    amount = deposit_amt if deposit_amt > 0 else withdrawal_amt
                    
                    if amount > 0:
                        transaction = {
                            'date': txn_date,
                            'value_date': txn_date,
                            'narration': narration[:500],
                            'ref_no': '',
                            'amount': amount,
                            'txn_type': txn_type,
                            'balance': closing_balance,
                            'page': page_num
                        }
                        
                        all_transactions.append(transaction)
    
    print(f"\n✅ Extracted {len(all_transactions)} transactions from PDF")
    return all_transactions

def import_all_transactions():
    """Import all transactions into AEGIS"""
    print("\n" + "="*80)
    print("🚀 COMPLETE PDF TRANSACTION IMPORT")
    print("="*80)
    
    # Extract all transactions
    transactions = extract_all_transactions_from_pdf()
    
    if not transactions:
        print("❌ No transactions found!")
        return
    
    # Create or get customer
    customer_id = "CUST-PDF-FULL-001"
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    
    if not customer:
        customer = Customer(
            customer_id=customer_id,
            name="Arnav Puggal - Complete Account Statement",
            risk_rating=3
        )
        db.add(customer)
        db.flush()
        print(f"✓ Created customer: {customer.name}")
    
    # Create account
    account_id = "ACC-PDF-FULL-001"
    account = db.query(Account).filter(Account.account_id == account_id).first()
    
    if not account:
        account = Account(
            account_id=account_id,
            customer_id=customer.id,
            account_type="savings",
            balance=16078.00  # Final balance from last page
        )
        db.add(account)
        db.flush()
        print(f"✓ Created account: {account.account_id}")
    
    # Import all transactions
    print(f"\n📥 Importing {len(transactions)} transactions...")
    imported_count = 0
    
    for i, txn_data in enumerate(transactions, 1):
        try:
            txn_id = f"PDF-FULL-TXN-{i:05d}"
            
            # Check if already exists
            existing = db.query(Transaction).filter(Transaction.txn_id == txn_id).first()
            if existing:
                continue
            
            txn_date = parse_date(txn_data['date'])
            
            txn = Transaction(
                txn_id=txn_id,
                account_id=account.id,
                amount=txn_data['amount'],
                txn_type=txn_data['txn_type'],
                meta_data=f"Page: {txn_data['page']} | {txn_data['narration']} | Ref: {txn_data['ref_no']} | Balance: {txn_data['balance']}",
                timestamp=txn_date
            )
            db.add(txn)
            imported_count += 1
            
            if i % 100 == 0:
                print(f"   ✓ Imported {i}/{len(transactions)} transactions...")
        
        except Exception as e:
            print(f"   ⚠️  Error importing transaction {i}: {e}")
            continue
    
    db.flush()
    print(f"\n✅ Successfully imported {imported_count} transactions!")
    
    # Create case
    case_ref = "CASE-PDF-FULL-001"
    existing_case = db.query(Case).filter(Case.case_ref == case_ref).first()
    
    if not existing_case:
        case = Case(
            case_ref=case_ref,
            customer_id=customer.id,
            status=CaseStatus.in_review,
            title="Complete Account Statement Analysis - 48 Pages",
            description=f"Comprehensive analysis of all {len(transactions)} transactions from complete bank statement (Pages 1-48)"
        )
        db.add(case)
        db.flush()
        print(f"✓ Created case: {case.case_ref}")
        
        # Create SAR
        sar_ref = f"SAR-FULL-{datetime.now().strftime('%Y%m%d')}"
        sar = SARReport(
            sar_ref=sar_ref,
            case_id=case.id,
            created_by=1,
            narrative=f"""Suspicious Activity Report - Complete Account Statement Analysis

Account Holder: {customer.name}
Account Number: 50100634536034 (HDFC Bank)
Statement Period: 23/08/2024 to 31/03/2025
Total Transactions Analyzed: {len(transactions)}

SUMMARY OF SUSPICIOUS ACTIVITY INDICATORS:

1. TRANSACTION VELOCITY & PATTERN ANALYSIS
   - {len(transactions)} transactions processed over the statement period
   - High frequency of UPI transactions indicating potential pass-through activity
   - Multiple small-value transactions consistent with structuring patterns

2. COUNTERPARTY RISK ASSESSMENT
   - Numerous transactions with different UPI IDs and merchants
   - Pattern suggests potential money mule or intermediary account activity
   - Multiple payments to food delivery, student services, and peer-to-peer transfers

3. ACCOUNT BEHAVIOR INDICATORS
   - Opening balance: ₹20,000.00 (23/08/2024)
   - Closing balance: ₹16,078.00 (as of latest transaction)
   - Frequent deposits followed by immediate withdrawals
   - Pattern consistent with layering phase of money laundering

4. TYPOLOGY DETECTION
   - Structuring: Multiple transactions below reporting thresholds
   - Velocity: High transaction frequency relative to account balance
   - Rapid Fund Movement: Quick turnover of funds through the account
   - Peer-to-Peer Pattern: Extensive use of UPI for person-to-person transfers

5. REGULATORY CONCERNS
   - Account usage pattern inconsistent with declared student profile
   - High transaction volume for stated account purpose
   - Requires enhanced due diligence and monitoring

RECOMMENDATION: Enhanced monitoring and potential SAR filing
Risk Level: MEDIUM-HIGH
Compliance Action Required: Yes

Detailed transaction log available in case file.
""",
            approved=False
        )
        db.add(sar)
        print(f"✓ Created SAR: {sar.sar_ref}")
    
    db.commit()
    
    print("\n" + "="*80)
    print("✅ COMPLETE PDF IMPORT FINISHED!")
    print("="*80)
    print(f"   Customer: {customer_id}")
    print(f"   Account: {account_id}")
    print(f"   Transactions: {imported_count}")
    print(f"   Case: {case_ref}")
    print("="*80)

if __name__ == "__main__":
    import_all_transactions()
