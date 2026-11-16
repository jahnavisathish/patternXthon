# SmartHome Hub ⌂

A minimalist, responsive Smart Home Automation Dashboard implemented directly from an Object-Oriented UML class diagram, featuring three classical **GoF Design Patterns**: **Singleton**, **Observer**, and **Strategy**.

![UML Diagram](./uml.png)

---

## 📌 Project Overview

This project simulates a centralized Smart Home controller with interactive smart appliances, dynamic mode execution, and live event telemetry. Built with clean, framework-free vanilla technologies, it prioritizes architectural clarity and minimal code footprint while adhering to an earthy, tactile design language (warm linen, charcoal, terracotta, and forest green—strictly avoiding generic AI purple and blue neon palettes).

- **Student / Author:** Jahnavi Chikkarsinakere Sathish  
- **Identifier:** `1MP24CG017`  
- **Event / Subject:** PatternXthon &bull; Software Architecture & Design Patterns  

---

## 🏗️ Design Pattern Architecture

The project maps 1:1 with the UML specification:

```
                      +-----------------------------+
                      |   «Singleton, Subject»      |
                      |    SmartHomeController      |
                      +-----------------------------+
                        /            |            \
                       /             |             \
                 (uses)          (contains)         (uses)
                   v                 v                v
        +---------------------+  +-----------------+  +-----------------+
        | NotificationService |  | «abstract»      |  |   «Strategy»    |
        +---------------------+  | SmartDevice     |  |    HomeMode     |
                                 +-----------------+  +-----------------+
                                     /    |   \   \
                                   v     v     v   v
                             [Light] [Fan] [AC] [SmartLock]
```

### 1. Singleton Pattern (`SmartHomeController`)
- **Role:** Ensures exactly one controller instance orchestrates the entire residence at runtime.
- **Implementation:** `getInstance()` method provides a global point of access, preventing conflicting controller states.

### 2. Observer Pattern (`Subject: SmartHomeController` $\rightarrow$ `Observer: SmartDevice`)
- **Role:** Decouples the controller from concrete device implementations.
- **Subject:** `SmartHomeController` maintains an observer collection and provides `addObserver()`, `removeObserver()`, and `notifyObservers()`.
- **Abstract Observer:** `SmartDevice` defines the interface (`turnOn()`, `turnOff()`, `getStatus()`, `update()`, and `powerUsage`).
- **Concrete Observers:**
  - `Light`: Manages `brightness` (10–100%) and `color` warmth presets (`adjustBrightness()`, `changeColor()`).
  - `Fan`: Manages `speed` (Levels 1–4) and `timer` options (`setSpeed()`, `setTimer()`).
  - `AirConditioner`: Precision thermostat (`16.0°C` – `30.0°C`) and operation modes (`Cool`, `Dry`, `Eco`).
  - `SmartLock`: Security latch control with PIN security status (`lock()`, `unlock()`).

### 3. Strategy Pattern (`HomeMode`)
- **Role:** Encapsulates home behavior profiles into interchangeable strategies.
- **Concrete Strategies:**
  - `Home`: Balanced comfort routine with ambient lighting and standard climate control.
  - `Away`: Eco standby with all lights and ventilation powered down, and perimeter fully locked.
  - `Night`: Dimmed warm illumination (20%), whisper fan circulation, and locked doors.
  - `Eco`: Low-draw climate regulation and natural circulation to minimize power consumption.

### 4. Supporting Components
- **`User`:** Represents the authenticated home occupant (`userId`, `name`, `email`, `phone`, login state).
- **`SmartHome`:** Manages address data (`42 Willow Creek Rd`) and perimeter status (`Armed` / `Disarmed`).
- **`NotificationService`:** Real-time event publisher logging state shifts, alerts, and strategy changes (`sendNotification()`, `sendAlert()`, `viewHistory()`).

---

## 📂 Repository Structure

```text
patternXthon/
├── index.html        # Semantic dashboard markup & UI structure
├── style.css         # Earthy minimal styling (Zero purple/blue AI colors)
├── script.js         # Object-oriented JavaScript implementing UML classes
├── server.py         # Optional zero-dependency local Python HTTP server
├── uml.png           # UML class diagram specification (PNG)
├── uml.jpeg          # UML class diagram source (JPEG)
└── README.md         # Comprehensive project documentation
```

---

## 🎨 Design Philosophy & Color Palette

The interface follows a warm architectural aesthetic designed for readability and calm interaction:

| Token | Hex Value | Role |
| :--- | :--- | :--- |
| **Canvas Background** | `#F5F4F0` | Warm Linen / Paper Sand |
| **Card Surface** | `#FFFFFF` | Crisp White Surface |
| **Borders** | `#E5E3DD` | Subtle Stone Divider |
| **Primary Text** | `#181715` | Volcanic Charcoal |
| **Accent / Focus** | `#C85A32` | Warm Terracotta / Ember |
| **Active Status** | `#2E7D47` | Forest Green |
| **Amber Warning** | `#B4690E` | Warm Ochre / Amber |

*(Strictly zero purple, violet, indigo, cyan, or generic AI neon gradients).*

---

## 🚀 Getting Started

### Method 1: Instant Browser View (No Installation)
Double-click **`index.html`** in your file manager or run:
```powershell
# Windows PowerShell
Start-Process .\index.html
```
The application runs client-side with **zero external dependencies or build tools**.

### Method 2: Local Python Server (Optional)
If you have Python installed:
```bash
python server.py
```
This serves the project locally at `http://localhost:8000` and automatically opens your default browser.

---

## 🧪 Interactive Features to Try

1. **Switch Strategy Modes:** Click **Away**, **Night**, or **Eco Mode** to watch connected devices automatically adjust their power, brightness, and locks.
2. **Observe Real-Time Telemetry:** Toggle individual appliances on or off and adjust sliders to see the total power draw (`kW`) update in real time.
3. **Trigger Security Commands:** Toggle the door lock or tap **Send Alert** to see event dispatches flow into the live `NotificationFeed`.
4. **Emergency Standby:** Click **Emergency Standby** under System Commands to immediately cut all non-essential observer loads.

---

## 📜 License

Created for academic presentation and design pattern evaluation under **PatternXthon**. Feel free to use and adapt this project for educational purposes.
