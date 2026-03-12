"""
Generate realistic PDF test data for Reliance Industries and Rodovia India.
Run: python generate_test_pdfs.py
Requires: pip install fpdf2
"""
from fpdf import FPDF
import os

class IntelliPDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 10)
        self.cell(0, 8, self.title_text if hasattr(self, 'title_text') else '', border=False, align='C')
        self.ln(10)

    def section(self, title, content):
        self.set_font('Helvetica', 'B', 11)
        self.cell(0, 8, title, ln=True)
        self.set_font('Helvetica', '', 9)
        self.multi_cell(0, 5, content)
        self.ln(4)

def make_pdf(filename, title, sections):
    pdf = IntelliPDF()
    pdf.title_text = title
    pdf.add_page()
    pdf.set_font('Helvetica', 'B', 16)
    pdf.cell(0, 12, title, ln=True, align='C')
    pdf.ln(6)
    for sec_title, sec_content in sections:
        pdf.section(sec_title, sec_content)
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    pdf.output(filename)
    print(f"  Created: {filename}")


# ===========================================================================
# RELIANCE INDUSTRIES
# ===========================================================================
print("\n=== RELIANCE INDUSTRIES ===")
base = "reliance-industries"

# 1. Annual Report Summary
make_pdf(f"{base}/reliance_annual_report_fy24.pdf",
    "RELIANCE INDUSTRIES LIMITED - Annual Report FY 2023-24",
    [
        ("Company Overview", 
         "Reliance Industries Limited (RIL) is an Indian multinational conglomerate headquartered in Mumbai, Maharashtra. "
         "CIN: L17110MH1973PLC019786. GSTIN: 27AABCR1718Q1Z5. PAN: AABCR1718Q.\n"
         "The company operates across Oil & Gas (O2C), Digital Services (Jio Platforms), Retail (Reliance Retail), "
         "and New Energy businesses. RIL is India's most valuable company by market capitalization at Rs 19.8 lakh crore."),

        ("Financial Highlights - FY 2023-24",
         "Consolidated Revenue from Operations: Rs 9,74,864 Crore (USD 117.0 Bn)\n"
         "EBITDA: Rs 1,78,677 Crore | EBITDA Margin: 18.3%\n"
         "Profit After Tax (PAT): Rs 79,020 Crore | PAT Margin: 8.1%\n"
         "Revenue Growth YoY: 2.6% | PAT Growth YoY: 7.2%\n"
         "Earnings Per Share (EPS): Rs 58.48\n"
         "Return on Equity (ROE): 9.4% | Return on Assets (ROA): 5.1%\n"
         "DSCR: 2.85x | Interest Coverage Ratio: 6.2x | Current Ratio: 1.18x\n"
         "Debt to Equity Ratio: 0.42x | Net Debt: Rs 1,25,000 Crore\n"
         "Promoter Holding: 50.31% | FII Holding: 23.45% | DII Holding: 14.82%"),

        ("Segment Performance",
         "O2C Business: Revenue Rs 5,48,000 Cr | EBITDA Rs 62,300 Cr | Margin 11.4%\n"
         "Jio Platforms: Revenue Rs 1,14,500 Cr | EBITDA Rs 54,800 Cr | Margin 47.9%\n"
         "  - Subscribers: 48.2 Crore | ARPU: Rs 182/month\n"
         "Reliance Retail: Revenue Rs 3,06,800 Cr | EBITDA Rs 23,000 Cr | Margin 7.5%\n"
         "  - Stores: 18,946 across India | Digital Commerce GMV: Rs 89,000 Cr\n"
         "New Energy: Investment of Rs 75,000 Cr in Giga Factories (Solar, Battery, Green H2)"),

        ("Capital Expenditure & Investments",
         "Total Capex FY24: Rs 1,52,486 Crore\n"
         "  - Jio 5G rollout: Rs 45,000 Cr (5G in 8,500+ cities)\n"
         "  - New Energy: Rs 28,000 Cr (Giga Factory Phase 1 in Jamnagar)\n"
         "  - Retail expansion: Rs 18,000 Cr (3,100 new stores)\n"
         "  - O2C debottlenecking: Rs 12,000 Cr\n"
         "Total Group Cash & Equivalents: Rs 2,14,000 Crore"),

        ("Corporate Governance & Board",
         "Board of Directors:\n"
         "  - Mukesh D. Ambani (Chairman & Managing Director)\n"
         "  - Nita M. Ambani (Non-Executive Director)\n"
         "  - Akash M. Ambani (Director - Jio Platforms)\n"
         "  - Isha M. Ambani (Director - Reliance Retail)\n"
         "  - 8 Independent Directors\n"
         "Statutory Auditors: Deloitte Haskins & Sells LLP (ICAI Reg: 117366W)\n"
         "Credit Rating: CRISIL AAA/Stable | ICRA AAA/Stable | Moody's Baa2/Positive\n"
         "CIBIL Commercial Score: 82/100 (Excellent)"),

        ("Risk Factors",
         "1. Crude oil price volatility impacting O2C margins\n"
         "2. Intense telecom competition from Bharti Airtel and BSNL revival\n"
         "3. Regulatory risk from TRAI tariff interventions\n"
         "4. Climate transition risk in oil refining operations\n"
         "5. Foreign exchange exposure on USD-denominated debt of $12.5 Bn\n"
         "6. Geopolitical risks affecting crude sourcing from Middle East\n"
         "No pending litigation of material nature. No NCLT/IBC proceedings."),
    ])

# 2. Board Minutes
make_pdf(f"{base}/reliance_board_minutes_q3_fy25.pdf",
    "RELIANCE INDUSTRIES LIMITED - Board Meeting Minutes - Q3 FY25",
    [
        ("Meeting Details",
         "Date: 18th January 2025\n"
         "Time: 11:00 AM IST\n"
         "Venue: Maker Chambers IV, 222 Nariman Point, Mumbai 400021\n"
         "Quorum: Present - 10 of 12 Directors"),

        ("Agenda Item 1: Q3 FY25 Financial Results",
         "The Board reviewed and approved the standalone and consolidated financial results "
         "for the quarter ended 31st December 2024.\n"
         "Consolidated Revenue: Rs 2,61,500 Crore (up 8.2% YoY)\n"
         "EBITDA: Rs 48,900 Crore (margin 18.7%)\n"
         "PAT: Rs 21,800 Crore (up 12.5% YoY)\n"
         "The Board expressed satisfaction with the consistent growth trajectory."),

        ("Agenda Item 2: Jio Platforms - 5G Network Expansion",
         "Mr. Akash Ambani presented the 5G rollout progress:\n"
         "- 5G coverage extended to 9,200+ cities and towns\n"
         "- 5G subscriber base: 15.8 Crore (33% of total)\n"
         "- Average 5G data consumption: 32 GB/month vs 24 GB on 4G\n"
         "- Jio AirFiber installations: 12 lakh homes connected\n"
         "RESOLVED: Additional capex of Rs 12,000 Crore approved for 5G densification in Tier-2/3 cities."),

        ("Agenda Item 3: New Energy Update",
         "Progress on Dhirubhai Ambani Green Energy Giga Complex, Jamnagar:\n"
         "- Solar Giga Factory: Phase 1 commissioning expected by June 2025\n"
         "- Battery Giga Factory: Construction 65% complete\n"
         "- Green Hydrogen: Pilot electrolyzer producing 1 ton/day\n"
         "- Total investment committed: Rs 75,000 Crore over FY24-FY27"),

        ("Agenda Item 4: Dividend Declaration",
         "RESOLVED: Interim dividend of Rs 10 per equity share (face value Rs 10) declared "
         "for FY 2024-25. Record date: 5th February 2025.\n"
         "Total payout: approximately Rs 6,765 Crore."),
    ])

# 3. Credit Rating Report
make_pdf(f"{base}/reliance_crisil_rating_report.pdf",
    "CRISIL CREDIT RATING REPORT - Reliance Industries Limited",
    [
        ("Rating Summary",
         "Entity: Reliance Industries Limited\n"
         "CIN: L17110MH1973PLC019786 | PAN: AABCR1718Q\n"
         "Long Term Rating: CRISIL AAA/Stable (Reaffirmed)\n"
         "Short Term Rating: CRISIL A1+ (Reaffirmed)\n"
         "Commercial Paper: CRISIL A1+ (Rs 25,000 Crore)\n"
         "NCD: CRISIL AAA/Stable (Rs 50,000 Crore)\n"
         "Rating Action Date: 15th November 2024"),

        ("Rating Rationale",
         "The ratings reflect RIL's dominant market position across key business segments, "
         "strong cash generation capabilities, and conservative financial profile. "
         "The stable outlook reflects CRISIL's expectation that the group will maintain its "
         "competitive position and strong financial metrics.\n\n"
         "Key Strengths:\n"
         "1. Diversified revenue base across O2C, Digital, and Retail\n"
         "2. Market leadership in Indian telecom (47.9% revenue market share)\n"
         "3. Largest organized retailer with 18,946 stores\n"
         "4. Strong cash reserves of Rs 2,14,000 Crore\n"
         "5. Consistent free cash flow generation of Rs 30,000+ Cr annually\n\n"
         "Key Risks:\n"
         "1. Elevated capex for New Energy may impact near-term leverage\n"
         "2. O2C margins vulnerable to global refining crack spread volatility"),

        ("Financial Summary (Consolidated)",
         "                      FY24        FY23        FY22\n"
         "Revenue (Rs Cr)    9,74,864    9,48,256    7,92,756\n"
         "EBITDA (Rs Cr)     1,78,677    1,65,432    1,23,456\n"
         "PAT (Rs Cr)           79,020       73,670       60,705\n"
         "Debt/Equity              0.42           0.45           0.52\n"
         "DSCR                       2.85           2.56           2.23\n"
         "Interest Coverage      6.20           5.80           4.90\n"
         "CIBIL Score                82               80               78"),
    ])


# ===========================================================================
# RODOVIA INDIA PRIVATE LIMITED
# ===========================================================================
print("\n=== RODOVIA INDIA PRIVATE LIMITED ===")
base2 = "rodovia-india"

# 1. Annual Report Summary
make_pdf(f"{base2}/rodovia_annual_report_fy24.pdf",
    "RODOVIA INDIA PRIVATE LIMITED - Annual Report FY 2023-24",
    [
        ("Company Overview",
         "Rodovia India Private Limited is a private limited company engaged in road construction, "
         "highway maintenance, and civil infrastructure development.\n"
         "CIN: U45209MH2020PTC344448 | PAN: AABCR5678P\n"
         "GSTIN: 27AABCR5678P1Z3\n"
         "Registered Office: 304, Trade World, Kamala Mills Compound, Lower Parel, Mumbai 400013\n"
         "Date of Incorporation: 14th March 2020\n"
         "Authorized Capital: Rs 5,00,00,000 (Rs 5 Crore)\n"
         "Paid-up Capital: Rs 2,50,00,000 (Rs 2.5 Crore)\n"
         "Industry: Construction - Roads, Highways & Bridges (NIC Code: 45209)"),

        ("Financial Highlights - FY 2023-24",
         "Revenue from Operations: Rs 58.6 Crore (prev year Rs 42.1 Crore)\n"
         "Revenue Growth YoY: 39.2%\n"
         "EBITDA: Rs 7.03 Crore | EBITDA Margin: 12.0%\n"
         "Profit After Tax (PAT): Rs 2.34 Crore | PAT Margin: 4.0%\n"
         "DSCR: 1.15x | Current Ratio: 0.92x\n"
         "Debt to Equity Ratio: 2.8x | Interest Coverage: 1.6x\n"
         "Total Debt: Rs 42.5 Crore (Working Capital: Rs 28 Cr + Term Loan: Rs 14.5 Cr)\n"
         "Cheque Bounce Rate: 4.2% (10 bounces out of 238 cheques)\n"
         "OD Utilization (Avg): 88% | Peak Utilization: 98%\n"
         "Promoter Holding: 100% (Private Limited)\n"
         "Note: Working capital cycle stretched to 95 days from 68 days in FY23."),

        ("Key Projects - FY 2024",
         "1. NHAI - NH-48 Bypass Road (Mumbai-Pune Expressway extension)\n"
         "   Contract Value: Rs 24.5 Crore | Status: 72% Complete | Delay: 4 months\n"
         "   Reason for delay: Land acquisition issues in Panvel stretch\n\n"
         "2. MMRDA - Thane Coastal Road Phase 2\n"
         "   Contract Value: Rs 18.2 Crore | Status: 55% Complete | On Schedule\n\n"
         "3. BMC - Bandra-Worli Sea Link Approach Road Maintenance\n"
         "   Contract Value: Rs 8.4 Crore | Status: 90% Complete | On Schedule\n\n"
         "4. L&T Sub-contract - Metro Line 3 Civil Work\n"
         "   Contract Value: Rs 12.8 Crore | Status: 40% Complete | Delay: 2 months\n"
         "   Reason: Delayed mobilization advance from L&T\n\n"
         "Total Order Book: Rs 63.9 Crore | Executable in 18 months"),

        ("Directors & Key Managerial Personnel",
         "Directors:\n"
         "  - Rajesh Kumar Sharma (Managing Director & Promoter) - DIN: 08567234\n"
         "  - Sunita Rajesh Sharma (Director & Promoter) - DIN: 08567235\n"
         "Statutory Auditors: M/s Gupta & Associates, Chartered Accountants\n"
         "  (ICAI Firm Reg: 112345W) - Partner: CA Suresh Gupta\n"
         "Company Secretary: Not appointed (exempted as private limited under threshold)\n"
         "Credit Rating: BWR BBB-/Negative (Brickwork Ratings)"),

        ("Risk Factors & Concerns",
         "1. CRITICAL - Stretched working capital cycle (95 days vs industry avg 65 days)\n"
         "2. HIGH - Debt/Equity at 2.8x significantly exceeds comfort level of 1.5x\n"
         "3. HIGH - Cheque bounce rate of 4.2% indicates cash flow stress\n"
         "4. MEDIUM - OD utilization consistently above 85%, limited headroom\n"
         "5. MEDIUM - Single geography concentration (Mumbai Metropolitan Region only)\n"
         "6. MEDIUM - Key customer concentration: NHAI 38%, MMRDA 28% (top 2 = 66%)\n"
         "7. LOW - Related party transactions with promoter-owned entity 'Sharma Constructions' "
         "totaling Rs 3.2 Crore for equipment rental\n\n"
         "Statutory Compliance: GST filings delayed in 4 out of 12 months.\n"
         "GST GSTR-1 vs GSTR-3B variance averages 11.2% (needs investigation).\n"
         "ITC Mismatch averaging 15.8% indicates potential input credit issues.\n"
         "Income Tax returns filed but with revised returns in 2 of last 3 years."),

        ("Auditor Observations",
         "Emphasis of Matter:\n"
         "1. The company's current ratio is below 1 (0.92), indicating potential liquidity stress.\n"
         "2. Certain trade receivables amounting to Rs 8.7 Crore are outstanding for more than "
         "180 days. Management expects full recovery but no confirmation obtained.\n"
         "3. Related party transactions with Sharma Constructions (Rs 3.2 Cr) appear to be at "
         "rates higher than prevailing market rates for similar equipment.\n"
         "Qualification: None\n"
         "Going Concern: Not qualified, but attention drawn to stretched working capital."),
    ])

# 2. Legal Notice
make_pdf(f"{base2}/rodovia_legal_notice_nclt.pdf",
    "LEGAL NOTICE - NCLT Mumbai Bench - Rodovia India Pvt Ltd",
    [
        ("Case Details",
         "Case No: CP/34/2024/NCLT/MUM\n"
         "Filed By: ABC Infracon Private Limited (Sub-contractor)\n"
         "Filed Against: Rodovia India Private Limited\n"
         "Date of Filing: 22nd August 2024\n"
         "Section: Section 9 of Insolvency and Bankruptcy Code, 2016\n"
         "Amount in Dispute: Rs 1,85,00,000 (Rs 1.85 Crore)"),

        ("Nature of Dispute",
         "The petitioner ABC Infracon Pvt Ltd claims that Rodovia India Pvt Ltd has defaulted "
         "on payments for civil sub-contracting work completed on the NHAI NH-48 Bypass project. "
         "Despite multiple reminders and a statutory demand notice under Section 8 of the IBC, "
         "the corporate debtor has failed to make payment.\n\n"
         "Key Facts:\n"
         "- Work completed: Earthwork and culvert construction on NH-48 Km 42-49\n"
         "- Invoices raised: 3 invoices totaling Rs 1.85 Crore\n"
         "- Invoice dates: March 2024, April 2024, May 2024\n"
         "- Payment terms: 45 days from date of invoice\n"
         "- Demand Notice served: 15th June 2024 (returned unacknowledged)\n"
         "- Response from Corporate Debtor: Partial dispute raised on workmanship quality"),

        ("Current Status",
         "Status as of January 2025:\n"
         "- NCLT Mumbai Bench has admitted the petition for hearing\n"
         "- Next hearing date: 15th March 2025\n"
         "- No interim resolution professional appointed yet\n"
         "- Rodovia India has filed a counter-claim disputing Rs 45 Lakh of the claimed amount\n"
         "- Pre-litigation mediation attempted but failed\n\n"
         "Note: This is the first IBC proceeding against Rodovia India. However, "
         "there are 2 additional civil suits pending in Bombay High Court for similar payment defaults."),
    ])

# 3. Board Minutes
make_pdf(f"{base2}/rodovia_board_minutes_oct24.pdf",
    "RODOVIA INDIA PVT LTD - Board Meeting Minutes - October 2024",
    [
        ("Meeting Details",
         "Date: 28th October 2024\n"
         "Time: 3:00 PM IST\n"
         "Venue: Registered Office, 304 Trade World, Lower Parel, Mumbai\n"
         "Present: Rajesh Kumar Sharma (MD), Sunita Rajesh Sharma (Director)\n"
         "Quorum: Met (2 of 2 directors present)"),

        ("Agenda Item 1: Review of Financial Position",
         "The Board reviewed the cash flow situation. Key observations:\n"
         "- Cash balance critically low at Rs 12.5 Lakh (vs Rs 89 Lakh in April)\n"
         "- Outstanding receivables: Rs 14.8 Crore (of which Rs 8.7 Cr overdue >180 days)\n"
         "- OD limit of Rs 28 Crore fully utilized at Rs 27.4 Crore\n"
         "- Upcoming repayment: Rs 3.5 Crore term loan installment due 15th November\n"
         "- Salary for September delayed by 8 days due to cash flow constraints\n\n"
         "The MD expressed confidence that NHAI payment of Rs 4.2 Crore expected by mid-November "
         "will ease the immediate cash crunch. However, if delayed, the company may need to seek "
         "additional working capital or request OD limit enhancement from HDFC Bank."),

        ("Agenda Item 2: NCLT Case - ABC Infracon",
         "The Board discussed the NCLT petition filed by ABC Infracon (Rs 1.85 Crore).\n"
         "Legal counsel has advised that the company has a reasonable defense on Rs 45 Lakh "
         "where workmanship issues can be demonstrated.\n"
         "RESOLVED: To settle the undisputed portion of Rs 1.40 Crore in installments over "
         "6 months, subject to NCLT approval. Legal fees estimated at Rs 12 Lakh."),

        ("Agenda Item 3: New Project - MSRDC Tender",
         "The company has submitted tender for MSRDC Road Widening Project in Nashik.\n"
         "Estimated contract value: Rs 22 Crore\n"
         "Earnest Money Deposit: Rs 44 Lakh (submitted via BG from HDFC Bank)\n"
         "Result expected: December 2024\n"
         "The Board noted that winning this contract is critical for revenue pipeline in FY26."),

        ("Agenda Item 4: Related Party Transactions",
         "Equipment rental from Sharma Constructions (promoter entity):\n"
         "- Total rental in H1 FY25: Rs 1.8 Crore\n"
         "- Market rate assessment: Rs 1.3 Crore (approximately 38% premium)\n"
         "- Justification: Equipment available on short notice, no mobilization delays\n"
         "RESOLVED: To continue existing arrangement but obtain competitive quotes for H2 FY25."),
    ])


print("\n=== ALL PDFs GENERATED SUCCESSFULLY ===")
print("Files are in: reliance-industries/ and rodovia-india/")
