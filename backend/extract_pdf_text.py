"""
Extract and display text from PDF to understand its structure
"""
import os
try:
    import PyPDF2
    import pdfplumber
except ImportError:
    print("Installing PDF libraries...")
    os.system("pip3 install PyPDF2 pdfplumber")
    import PyPDF2
    import pdfplumber

pdf_path = '/Users/arnav/Code/AEGIS/AEGIS/testpdf.pdf'
PDF_PASSWORD = '242846433'

print("=" * 100)
print("EXTRACTING PDF CONTENT WITH PDFPLUMBER (Better for tables)")
print("=" * 100)

try:
    with pdfplumber.open(pdf_path, password=PDF_PASSWORD) as pdf:
        print(f"\n📄 PDF has {len(pdf.pages)} pages\n")
        
        for page_num, page in enumerate(pdf.pages, 1):
            print(f"\n{'='*100}")
            print(f"PAGE {page_num}")
            print(f"{'='*100}\n")
            
            # Extract text
            text = page.extract_text()
            print(text)
            
            # Try to extract tables
            tables = page.extract_tables()
            if tables:
                print(f"\n--- FOUND {len(tables)} TABLE(S) ON PAGE {page_num} ---")
                for table_idx, table in enumerate(tables, 1):
                    print(f"\nTable {table_idx}:")
                    for row in table[:10]:  # Show first 10 rows
                        print(row)
            
            print("\n" + "="*100)
            
except Exception as e:
    print(f"❌ Error with pdfplumber: {e}")
    print("\nTrying with PyPDF2...")
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Decrypt if password protected
            if pdf_reader.is_encrypted:
                pdf_reader.decrypt(PDF_PASSWORD)
            
            print(f"\n📄 PDF has {len(pdf_reader.pages)} pages\n")
            
            for page_num, page in enumerate(pdf_reader.pages, 1):
                print(f"\n{'='*100}")
                print(f"PAGE {page_num}")
                print(f"{'='*100}\n")
                text = page.extract_text()
                print(text)
    except Exception as e2:
        print(f"❌ Error with PyPDF2: {e2}")
