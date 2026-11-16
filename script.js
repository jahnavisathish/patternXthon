/**
 * SmartHome Hub - JavaScript Implementation
 * Directly mirrors the UML Class Diagram:
 * - Singleton & Subject: SmartHomeController
 * - Observer Hierarchy: SmartDevice -> Light, Fan, AirConditioner, SmartLock
 * - Strategy: HomeMode
 * - NotificationService & User
 */

// ==========================================
// 1. NotificationService
// ==========================================
class NotificationService {
  constructor() {
    this.history = [];
    this.counter = 1;
  }

  sendNotification(type, message) {
    const notif = {
      notifId: this.counter++,
      type: type,
      message: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.history.unshift(notif);
    this.renderToUI(notif);
    return notif;
  }

  sendAlert(message) {
    return this.sendNotification('ALERT', message);
  }

  viewHistory() {
    return this.history;
  }

  renderToUI(notif) {
    const feed = document.getElementById('feedList');
    if (!feed) return;
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = `
      <div>
        <span class="tag">${notif.type}</span>
        <span>${notif.message}</span>
      </div>
      <span class="feed-time">${notif.timestamp}</span>
    `;
    feed.insertBefore(item, feed.firstChild);
  }
}

// ==========================================
// 2. Observer Pattern: SmartDevice (Abstract)
// ==========================================
class SmartDevice {
  constructor(deviceId, deviceName, powerUsage = 0) {
    if (new.target === SmartDevice) {
      throw new TypeError("Cannot instantiate abstract class SmartDevice directly.");
    }
    this.deviceId = deviceId;
    this.deviceName = deviceName;
    this.status = true; // boolean
    this.basePower = powerUsage;
    this.powerUsage = powerUsage; // double
  }

  turnOn() {
    this.status = true;
    this.update();
  }

  turnOff() {
    this.status = false;
    this.powerUsage = 0;
    this.update();
  }

  getStatus() {
    return this.status;
  }

  update() {
    // Observer update hook
    const controller = SmartHomeController.getInstance();
    controller.calculateTotalPower();
  }
}

// Subclasses of SmartDevice
class Light extends SmartDevice {
  constructor(deviceId, deviceName, brightness = 80, color = "Warm Amber") {
    super(deviceId, deviceName, 14.0);
    this.brightness = brightness;
    this.color = color;
  }

  adjustBrightness(val) {
    this.brightness = parseInt(val, 10);
    if (this.status) {
      this.powerUsage = Math.round(4 + (this.brightness / 100) * 12);
    }
    this.update();
  }

  changeColor(newColor) {
    this.color = newColor;
    SmartHomeController.getInstance().notifications.sendNotification('LIGHT', `Tone set to ${newColor}`);
  }
}

class Fan extends SmartDevice {
  constructor(deviceId, deviceName, speed = 2, timer = "1h") {
    super(deviceId, deviceName, 55.0);
    this.speed = speed;
    this.timer = timer;
  }

  setSpeed(speedLevel) {
    this.speed = speedLevel;
    if (this.status) {
      this.powerUsage = 25 + speedLevel * 15;
    }
    this.update();
  }

  setTimer(duration) {
    this.timer = duration;
    SmartHomeController.getInstance().notifications.sendNotification('FAN', `Timer set to ${duration}`);
  }
}

class AirConditioner extends SmartDevice {
  constructor(deviceId, deviceName, temperature = 22.5, mode = "Cool") {
    super(deviceId, deviceName, 1150.0);
    this.temperature = temperature;
    this.mode = mode;
  }

  setTemperature(temp) {
    this.temperature = Math.min(30, Math.max(16, Math.round(temp * 10) / 10));
    this.update();
  }

  setMode(modeName) {
    this.mode = modeName;
    SmartHomeController.getInstance().notifications.sendNotification('CLIMATE', `AC mode switched to ${modeName}`);
  }
}

class SmartLock extends SmartDevice {
  constructor(deviceId, deviceName, accessCode = "2401") {
    super(deviceId, deviceName, 5.0);
    this.lockStatus = true; // boolean: true = locked
    this.accessCode = accessCode;
  }

  lock() {
    this.lockStatus = true;
    SmartHomeController.getInstance().notifications.sendNotification('SECURITY', 'Front Entry Lock engaged.');
    this.update();
  }

  unlock() {
    this.lockStatus = false;
    SmartHomeController.getInstance().notifications.sendNotification('SECURITY', 'Front Entry Lock unlocked.');
    this.update();
  }
}

// ==========================================
// 3. Strategy Pattern: HomeMode
// ==========================================
class HomeMode {
  constructor(modeName, description) {
    this.modeName = modeName;
    this.description = description;
  }

  activateMode(controller) {
    controller.activeMode = this.modeName;
    controller.notifications.sendNotification('STRATEGY', `Strategy changed to ${this.modeName}.`);

    // Strategy executions across observers
    const devices = controller.devices;
    if (this.modeName === 'Away') {
      devices.light.turnOff();
      devices.fan.turnOff();
      devices.lock.lock();
    } else if (this.modeName === 'Night') {
      devices.light.turnOn();
      devices.light.adjustBrightness(20);
      devices.lock.lock();
    } else if (this.modeName === 'Home') {
      devices.light.turnOn();
      devices.light.adjustBrightness(80);
      devices.fan.turnOn();
    } else if (this.modeName === 'Eco') {
      devices.ac.setMode('Eco');
      devices.fan.setSpeed(1);
    }
  }

  deactivateMode() {
    // cleanup if needed
  }
}

// ==========================================
// 4. Singleton & Subject: SmartHomeController
// ==========================================
class SmartHomeController {
  static instance = null;

  constructor() {
    if (SmartHomeController.instance) {
      return SmartHomeController.instance;
    }

    this.controllerId = 101;
    this.connectionStatus = true;
    this.activeMode = "Home";
    this.observers = []; // List of SmartDevices
    this.notifications = new NotificationService();

    // Registry of concrete devices
    this.devices = {
      light: new Light(301, "Living Room Light"),
      fan: new Fan(302, "Ceiling Fan"),
      ac: new AirConditioner(303, "Air Conditioner"),
      lock: new SmartLock(304, "Front Entry Lock")
    };

    // Modes
    this.modes = {
      'Home': new HomeMode('Home', 'Standard routine active. Devices set for comfortable daily living with balanced climate control and lighting.'),
      'Away': new HomeMode('Away', 'Energy-saving away profile. Climate set to eco standby, lights powered down, perimeter fully locked.'),
      'Night': new HomeMode('Night', 'Quiet evening preset. Ambient lights dimmed to 20%, low whisper fan operation, doors locked.'),
      'Eco': new HomeMode('Eco', 'Peak conservation strategy. Power consumption reduced by cycling AC compressor and using natural ventilation.')
    };

    // Register observers
    for (const key in this.devices) {
      this.addObserver(this.devices[key]);
    }

    SmartHomeController.instance = this;
  }

  static getInstance() {
    if (!SmartHomeController.instance) {
      SmartHomeController.instance = new SmartHomeController();
    }
    return SmartHomeController.instance;
  }

  addObserver(device) {
    this.observers.push(device);
  }

  removeObserver(device) {
    this.observers = this.observers.filter(obs => obs !== device);
  }

  notifyObservers() {
    this.observers.forEach(obs => obs.update());
    this.notifications.sendNotification('SUBJECT', `SmartHomeController synchronized ${this.observers.length} observers.`);
  }

  executeCommand(commandName, ...args) {
    if (typeof this[commandName] === 'function') {
      return this[commandName](...args);
    }
  }

  calculateTotalPower() {
    let total = 0;
    let active = 0;
    for (const key in this.devices) {
      const dev = this.devices[key];
      if (dev.status) {
        active++;
        total += dev.powerUsage;
      }
    }

    const kwElem = document.getElementById('totalPower');
    const countElem = document.getElementById('activeCount');
    if (kwElem) kwElem.innerText = (total / 1000).toFixed(2) + ' kW';
    if (countElem) countElem.innerText = `${active} of ${this.observers.length} Devices`;
  }
}

// ==========================================
// 5. UI Event Binding
// ==========================================
const app = SmartHomeController.getInstance();

// Initialize initial UI states
document.addEventListener('DOMContentLoaded', () => {
  app.calculateTotalPower();
  app.notifications.sendNotification('NOTIF', 'SmartHomeController initialized with 4 observers.');
  app.notifications.sendNotification('MODE', 'Strategy initialized: Home Mode.');
});

// Device Toggles
function toggleDeviceUI(key) {
  const dev = app.devices[key];
  const checkbox = document.getElementById(`${key}Switch`);
  const card = document.getElementById(`card-${key}`);

  if (checkbox.checked) {
    dev.turnOn();
    card.classList.add('is-active');
    app.notifications.sendNotification('UPDATE', `${dev.deviceName} turned ON.`);
  } else {
    dev.turnOff();
    card.classList.remove('is-active');
    app.notifications.sendNotification('UPDATE', `${dev.deviceName} turned OFF.`);
  }
}

// Light controls
function updateBrightnessUI(val) {
  app.devices.light.adjustBrightness(val);
  document.getElementById('brightnessVal').innerText = val + '%';
  document.getElementById('lightPower').innerText = app.devices.light.powerUsage + ' W';
}

function setLightToneUI(btn, tone) {
  app.devices.light.changeColor(tone);
  btn.parentElement.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// Fan controls
function setFanSpeedUI(speed, btn) {
  app.devices.fan.setSpeed(speed);
  btn.parentElement.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('fanSpeedLabel').innerText = speed === 4 ? 'Max' : 'Level ' + speed;
  document.getElementById('fanPower').innerText = app.devices.fan.powerUsage + ' W';
}

function setFanTimerUI(timer, btn) {
  app.devices.fan.setTimer(timer);
  btn.parentElement.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('fanTimerLabel').innerText = timer;
}

// AC controls
function adjustTempUI(delta) {
  const ac = app.devices.ac;
  ac.setTemperature(ac.temperature + delta);
  document.getElementById('acTemp').innerText = ac.temperature.toFixed(1);
}

function setAcModeUI(mode, btn) {
  app.devices.ac.setMode(mode);
  btn.parentElement.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// Smart Lock controls
function toggleLockUI() {
  const lock = app.devices.lock;
  const text = document.getElementById('lockStatusText');
  const btn = document.getElementById('lockToggleBtn');

  if (lock.lockStatus) {
    lock.unlock();
    text.innerText = "Unlocked";
    text.style.color = "var(--green)";
    btn.innerText = "Tap to Lock";
  } else {
    lock.lock();
    text.innerText = "Locked";
    text.style.color = "var(--accent)";
    btn.innerText = "Tap to Unlock";
  }
}

// Strategy Mode switch
function setModeUI(modeKey) {
  const strategy = app.modes[modeKey];
  if (!strategy) return;

  strategy.activateMode(app);

  // Update UI headers
  document.getElementById('activeModeTitle').innerText = strategy.modeName + (modeKey === 'Eco' ? ' Mode' : ' Mode');
  document.getElementById('modeDescription').innerText = strategy.description;

  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === modeKey);
  });

  // Sync controls UI with device states
  document.getElementById('lightSwitch').checked = app.devices.light.status;
  document.getElementById('card-light').classList.toggle('is-active', app.devices.light.status);
  document.getElementById('brightnessInput').value = app.devices.light.brightness;
  document.getElementById('brightnessVal').innerText = app.devices.light.brightness + '%';

  document.getElementById('fanSwitch').checked = app.devices.fan.status;
  document.getElementById('card-fan').classList.toggle('is-active', app.devices.fan.status);

  const lockText = document.getElementById('lockStatusText');
  const lockBtn = document.getElementById('lockToggleBtn');
  if (app.devices.lock.lockStatus) {
    lockText.innerText = "Locked";
    lockText.style.color = "var(--accent)";
    lockBtn.innerText = "Tap to Unlock";
  } else {
    lockText.innerText = "Unlocked";
    lockText.style.color = "var(--green)";
    lockBtn.innerText = "Tap to Lock";
  }

  app.calculateTotalPower();
}

// Quick action buttons
function triggerAlertUI() {
  app.notifications.sendAlert('User dispatched manual emergency check.');
}

function refreshObserversUI() {
  app.notifyObservers();
}

function emergencyShutdownUI() {
  for (const k in app.devices) {
    app.devices[k].turnOff();
    const cb = document.getElementById(`${k}Switch`);
    if (cb) cb.checked = false;
    const card = document.getElementById(`card-${k}`);
    if (card) card.classList.remove('is-active');
  }
  app.calculateTotalPower();
  app.notifications.sendAlert('Emergency Standby: All observer devices turned OFF.');
}

let securityArmed = true;
function toggleSecurityUI() {
  securityArmed = !securityArmed;
  const btn = document.getElementById('securityBtn');
  btn.innerText = securityArmed ? 'Security: Armed' : 'Security: Disarmed';
  app.notifications.sendNotification('SECURITY', securityArmed ? 'Perimeter Armed.' : 'Perimeter Disarmed.');
}
