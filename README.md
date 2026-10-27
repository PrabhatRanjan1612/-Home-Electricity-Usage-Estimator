# Home Electricity Usage Estimator (HTML, CSS, JavaScript)

> **MCA College Project** — Client-Side Software Architecture & Smart Utility Analytics  
> **Tech Stack**: HTML5 · CSS3 · Vanilla JavaScript (ES6+) · Web Storage API (localStorage)

---

## 🚀 Quick Start
No server, installation, or build tools required.
Simply open index.html in any modern web browser:
- **Chrome**, **Edge**, **Firefox**, **Brave**, or **Safari**.
- Double-click index.html or right-click and choose **Open with Chrome**.

---

## ⚡ Key Features Implemented

1. **Electricity Rate Management**:
   - Customizable utility rate per unit (e.g., ₹7.50 / .15 per kWh).
   - Multi-currency support (₹ INR, $ USD, € EUR, £ GBP).
   - **Validation**: Enforces numeric, positive rates (> 0) with clear error prompts.

2. **Appliance Data Collection & Validation Loop**:
   - Appliance Name, Power in Watts (W), Quantity (≥ 1), Daily Operating Hours (0–24 hrs).
   - Quick-pick presets for AC, Refrigerator, Ceiling Fan, TV, Geyser, Washing Machine.
   - **Error Handling Loop**:
     - Identifies empty name, power ≤ 0, quantity < 1, or hours not in [0, 24].
     - Visually highlights invalid fields with red borders & shake animation.
     - Sets focus to the first invalid field and alerts user to correct data before computing.

3. **Core Mathematical Calculations**:
   - **Daily Consumption**: Daily kWh = (Power × Quantity × Hours) / 1000
   - **Monthly Consumption**: Monthly kWh = Daily kWh × 30
   - **Estimated Cost**: Estimated Cost = Monthly kWh × Electricity Rate

4. **Interactive Dashboard**:
   - 5 KPI summary cards (Daily Units, Monthly Units, Monthly Bill, Peak Consumer, Usage Level).
   - **Usage Level Meter**: Color-coded categorization (Low <150 kWh, Moderate 150–300 kWh, High >300 kWh).
   - Dynamic contextual energy-saving recommendations based on high-load devices.
   - Graphical energy share breakdown bar chart.

5. **LocalStorage Persistence**:
   - Browser localStorage maintains tariff, appliances list, and state across page reloads.

6. **Advanced Utilities**:
   - **What-If Calculator**: Simulates consumption and monetary savings if daily hours are altered.
   - **Appliance Comparator**: Side-by-side comparison of any two appliances.
   - **CSV Export**: Downloads a tabular energy consumption report for documentation.
   - **A4 Printable Flowchart**: Standalone single-page A4 vector diagram (lowchart.html).

---

## 📂 Project Structure

`
home-electricity-estimator/
│
├── index.html         # Semantic HTML5 layout, cards, forms & native dialogs
├── styles.css         # Modern CSS3 stylesheet (Grid, Flexbox, Animations, Variables)
├── app.js             # Pure ES6+ controller, validation loops, calculation engine
├── flowchart.html     # ISO 5807 vector flowchart (A4 print ready)
└── README.md          # Project documentation and user guide
`
