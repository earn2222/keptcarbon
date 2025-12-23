This **Software Requirements Specification (SRS)** is structured for a spec-driven development process, integrating the feature requirements from the "ตารางเเยก.docx" file  with the visual identity and layout of the **ra-admin** theme.

---

## **1. Design Language & UI Framework**

Following the **ra-admin** design system:

* **Layout:** A **Sidebar Navigation** layout with a light-themed background and rounded "Card" components.
* **Color Palette:** Primary colors are **Eco-Green** (for actions and positive status) and **Clean White/Light Grey** for the workspace.
* **Components:** High use of **Summary Cards**, **Interactive Charts**, and **Data Tables** with clear typography.

---

## **2. Functional Specifications by Page**

### **Page 1: Landing & Authentication**

* 
**Hero Section**: Displays the system name and a brief description as a rubber plantation carbon sequestration assessment tool.


* 
**Navigation Bar**: Includes menus for "Home" and "Login".


* 
**Authentication**: Users login via **Email and Password only**.


* 
**Value Proposition**: Highlights the system's ability to calculate carbon and manage plots via maps.


* 
**Call to Action (CTA)**: A primary button to "Start Assessment" to drive user engagement.



### **Page 2: Map-Based Plot Management**

* 
**Map Interface**: Features annual satellite imagery with Zoom In/Out capabilities.


* 
**Location Services**: Includes a "Current Location" pin and a search function for administrative boundaries (Province/District/Sub-district).


* **Plot Tools**:
* Draw rubber plots using **Polygon tools** or upload **SHP files**.


* Automatic calculation of area in Square Meters and Thai units (Rai/Ngan/Wa).


* Display coordinate systems in Lat/Long or UTM.


* Tools to Edit or Delete plots.




* 
**Data Entry**: Users must input the Plot Name and **Planting Year** to automatically calculate the age of the trees.


* 
**Status Indicators**: Alerts for "Missing Information" and a "Next" button for carbon calculation.



### **Page 3: Dashboard (Executive Summary)**

* 
**Summary Cards**: Top-level cards showing Total Plots, Total Area, and Total Carbon Sequestration (Tons ).


* **Visual Map Analysis**:
* Map colored by tree age with a visual Legend.


* Ability to view annual satellite overlays.




* **Interactive Data**:
* Popups or tables showing plot name, area, tree age, and calculated **Above-ground Biomass**.


* Specific carbon sequestration calculations per plot (Tons Carbon/Plot).




* **Analytics Charts**:
* Yearly Carbon Graph and Cumulative Carbon by tree age.


* Cross-plot comparison graphs to analyze efficiency and trends.





### **Page 4: History & Detailed Records**

* 
**Owner Profile**: Displays owner name, province, and profile image.


* 
**Summary Box**: Quick view of total plots and total area in Rai.


* 
**Carbon Results**: Shows total carbon, latest annual value, and year-over-year change.


* 
**Trend Analysis**: Line or Area charts showing carbon levels over time with hover details.


* 
**Data Filtering**: Dropdowns to filter by specific Plot or specific Year.


* 
**Historical Table**: Comprehensive log including Year, Plot, Area, Biomass, , and Assessment Status.


* 
**Deep Dive**: Detailed view for individual plots including assessment date, notes, and file attachments.



---

## **3. Technical Logic (Rubber Specific)**

* 
**Age Calculation**: .


* 
**Carbon Logic**: Specific formulas for **Above-ground Biomass** and **Carbon Sequestration** tailored for rubber trees (Hevea brasiliensis).



Would you like me to generate the **User Stories** or a **Database Schema** based on this specification?