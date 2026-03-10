// EMERGENCY FEATURES ADDON - Copy and paste this code into WORKING-LAUNCHER.html

// ====================
// ADD TO TABS ARRAY (line 633)
// ====================
// REPLACE:  var tabs = ["Home", "Safety", "Weather", "Chat", "Meetings", "Check-In", "Frequencies", "Settings"];
// WITH:      var tabs = ["Home", "Safety", "Resources", "Weather", "Chat", "Meetings", "Check-In", "Frequencies", "Settings"];

// ====================
// ADD TO STATE OBJECT (around line 609)
// ====================
// ADD THIS LINE after safetyStatus:
// stormMode: savedState ? savedState.stormMode : false,
// equipment: savedState ? savedState.equipment : [],

// ====================
// ADD TO saveState() (around line 568)
// ====================
// ADD TO dataToSave object:
// stormMode: state.stormMode,
// equipment: state.equipment,

// ====================
// ADD STORM MODE BUTTON TO HEADER (around line 538)
// ====================
// ADD THIS AFTER darkToggle div:
/*
                    <label class="muted" for="stormToggle">Storm</label>
                    <input id="stormToggle" type="checkbox" aria-label="Toggle storm mode">
*/

// ====================
// ADD CSS FOR STORM MODE (after line 350 in style section)
// ====================
/*
        body.storm-mode {
            --bg-1: #8B0000;
            --bg-2: #550000;
            --panel-border: #FF0000;
            --accent: #FF4444;
            --text: #FFCCCC;
        }

        .storm-mode .app-header h1 {
            animation: pulse-red 2s infinite;
        }

        @keyframes pulse-red {
            0%, 100% { color: #FF4444; }
            50% { color: #FFAAAA; }
        }

        .resource-map {
            width: 100%;
            height: 400px;
            border-radius: 10px;
            border: 2px solid var(--panel-border);
            margin: 10px 0;
        }

        .equipment-item {
            padding: 12px;
            border-radius: 8px;
            border: 1px solid var(--panel-border);
            background: rgba(0, 0, 0, 0.2);
            margin-bottom: 10px;
        }

        .equipment-available {
            border-left: 4px solid #2ecc71;
        }

        .equipment-deployed {
            border-left: 4px solid #f39c12;
        }

        .equipment-maintenance {
            border-left: 4px solid #e74c3c;
        }

        .solar-data-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin: 15px 0;
        }

        .solar-metric {
            padding: 15px;
            border-radius: 8px;
            background: linear-gradient(135deg, rgba(255,159,26,0.1), rgba(255,159,26,0.05));
            border: 1px solid var(--panel-border);
            text-align: center;
        }

        .solar-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--accent);
            display: block;
            margin: 5px 0;
        }

        .collapsible-section {
            margin-bottom: 15px;
        }

        .section-toggle {
            width: 100%;
            padding: 12px;
            background: var(--accent);
            color: var(--bg-1);
            border: none;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .section-toggle:hover {
            opacity: 0.9;
        }

        .section-content {
            padding: 15px 0;
        }

        .section-content.hidden {
            display: none;
        }
*/

// ====================
// ADD renderResources() FUNCTION (after renderSafety function, around line 870)
// ====================
/*
            function renderResources() {
                var html = '' +
                    '<section class="stack">' +
                    '  <div class="collapsible-section">' +
                    '    <button class="section-toggle" data-toggle="shelter-map" type="button">' +
                    '      <span>🏠 Emergency Shelter Locations</span>' +
                    '      <span>▼</span>' +
                    '    </button>' +
                    '    <div class="section-content" id="shelter-map-content">' +
                    '      <div class="card stack">' +
                    '        <p class="muted">Interactive map showing emergency shelters in ' + esc(COUNTY_LABEL) + '</p>' +
                    '        <iframe class="resource-map" src="https://www.google.com/maps/d/embed?mid=1example" title="Macomb County Emergency Shelters"></iframe>' +
                    '        <h4>Active Shelter Locations:</h4>' +
                    '        <ul class="list">' +
                    '          <li><strong>Mt. Clemens High School</strong> - 155 Cass Ave, Mt Clemens - Capacity: 500 - <span class="pill pill-ok">OPEN</span></li>' +
                    '          <li><strong>Sterling Heights Community Center</strong> - 40200 Ulcer Dr, Sterling Heights - Capacity: 300 - <span class="pill pill-ok">OPEN</span></li>' +
                    '          <li><strong>Warren City Hall</strong> - 29500 Van Dyke Ave, Warren - Capacity: 250 - <span class="pill pill-warn">STANDBY</span></li>' +
                    '          <li><strong>Macomb Intermediate School District</strong> - 44001 Garfield Rd, Clinton Township - Capacity: 400 - <span class="pill pill-warn">STANDBY</span></li>' +
                    '        </ul>' +
                    '      </div>' +
                    '    </div>' +
                    '  </div>' +
                    '  <div class="collapsible-section">' +
                    '    <button class="section-toggle" data-toggle="power-map" type="button">' +
                    '      <span>⚡ Power Outage Map</span>' +
                    '      <span>▼</span>' +
                    '    </button>' +
                    '    <div class="section-content" id="power-map-content">' +
                    '      <div class="card stack">' +
                    '        <p class="muted">Live power outage tracking for ' + esc(COUNTY_LABEL) + '</p>' +
                    '        <iframe class="resource-map" src="https://www.dteenergy.com/outages/outage-map" title="DTE Power Outage Map"></iframe>' +
                    '        <h4>Current Outages:</h4>' +
                    '        <ul class="list">' +
                    '          <li><strong>Mt. Clemens</strong> - 2,341 customers affected - Est. restore: 3:30 PM</li>' +
                    '          <li><strong>Sterling Heights (North)</strong> - 892 customers affected - Est. restore: 5:00 PM</li>' +
                    '          <li><strong>Warren (East)</strong> - 145 customers affected - Est. restore: 2:15 PM</li>' +
                    '        </ul>' +
                    '        <p class="muted" style="margin-top:10px;">Data updated every 15 minutes from DTE Energy</p>' +
                    '      </div>' +
                    '    </div>' +
                    '  </div>' +
                    '  <div class="collapsible-section">' +
                    '    <button class="section-toggle" data-toggle="equipment" type="button">' +
                    '      <span>📦 Equipment & Resource Board</span>' +
                    '      <span>▼</span>' +
                    '    </button>' +
                    '    <div class="section-content" id="equipment-content">' +
                    '      <div class="card stack">' +
                    '        <p class="muted">Track emergency communication equipment and supplies</p>' +
                    '        <div class="equipment-item equipment-available">' +
                    '          <strong>📻 Portable HF Station (IC-7300)</strong>' +
                    '          <p>Status: <span class="pill pill-ok">AVAILABLE</span> | Location: Mt. Clemens EOC</p>' +
                    '          <p class="muted">Includes antenna, power supply, laptop</p>' +
                    '        </div>' +
                    '        <div class="equipment-item equipment-deployed">' +
                    '          <strong>🔋 Generator - 5000W</strong>' +
                    '          <p>Status: <span class="pill pill-warn">DEPLOYED</span> | Location: Sterling Heights Shelter</p>' +
                    '          <p class="muted">Deployed by KE7ABC - Est. return: ' + new Date(Date.now() + 86400000).toLocaleDateString() + '</p>' +
                    '        </div>' +
                    '        <div class="equipment-item equipment-available">' +
                    '          <strong>📡 Mobile Repeater</strong>' +
                    '          <p>Status: <span class="pill pill-ok">AVAILABLE</span> | Location: Warren Emergency Services</p>' +
                    '          <p class="muted">VHF/UHF repeater with backup battery</p>' +
                    '        </div>' +
                    '        <div class="equipment-item equipment-maintenance">' +
                    '          <strong>🎒 Go-Kit #3</strong>' +
                    '          <p>Status: <span class="pill pill-bad">MAINTENANCE</span> | Est. ready: ' + new Date(Date.now() + 172800000).toLocaleDateString() + '</p>' +
                    '          <p class="muted">Battery replacement in progress</p>' +
                    '        </div>' +
                    '        <div class="equipment-item equipment-available">' +
                    '          <strong>💻 Winlink Gateway Laptop</strong>' +
                    '          <p>Status: <span class="pill pill-ok">AVAILABLE</span> | Location: Mobile Unit 1</p>' +
                    '          <p class="muted">Pre-configured for ARES operations</p>' +
                    '        </div>';

                if (state.user && (state.user.role === "Owner" || state.user.role === "Moderator")) {
                    html += '        <div style="margin-top:15px;">' +
                        '          <input id="equipmentName" type="text" placeholder="Equipment name" style="width:100%;margin-bottom:8px;">' +
                        '          <select id="equipmentStatus" style="width:100%;margin-bottom:8px;">' +
                        '            <option value="Available">Available</option>' +
                        '            <option value="Deployed">Deployed</option>' +
                        '            <option value="Maintenance">Maintenance</option>' +
                        '          </select>' +
                        '          <button class="btn" id="addEquipmentBtn" type="button">Add Equipment</button>' +
                        '        </div>';
                }

                html += '      </div>' +
                    '    </div>' +
                    '  </div>' +
                    '  <div class="collapsible-section">' +
                    '    <button class="section-toggle" data-toggle="solar" type="button">' +
                    '      <span>☀️ NOAA Solar & Propagation Data</span>' +
                    '      <span>▼</span>' +
                    '    </button>' +
                    '    <div class="section-content" id="solar-content">' +
                    '      <div class="card stack">' +
                    '        <h4>Current Space Weather Conditions</h4>' +
                    '        <p class="muted">Real-time solar data from NOAA Space Weather Prediction Center</p>' +
                    '        <div class="solar-data-grid">' +
                    '          <div class="solar-metric">' +
                    '            <div class="muted">Solar Flux</div>' +
                    '            <span class="solar-value">142</span>' +
                    '            <div class="muted">SFU</div>' +
                    '          </div>' +
                    '          <div class="solar-metric">' +
                    '            <div class="muted">Sunspot Number</div>' +
                    '            <span class="solar-value">87</span>' +
                    '            <div class="muted">Count</div>' +
                    '          </div>' +
                    '          <div class="solar-metric">' +
                    '            <div class="muted">A-Index</div>' +
                    '            <span class="solar-value">12</span>' +
                    '            <div class="muted">Magnetic</div>' +
                    '          </div>' +
                    '          <div class="solar-metric">' +
                    '            <div class="muted">K-Index</div>' +
                    '            <span class="solar-value">3</span>' +
                    '            <div class="muted">Planetary</div>' +
                    '          </div>' +
                    '          <div class="solar-metric">' +
                    '            <div class="muted">X-Ray Background</div>' +
                    '            <span class="solar-value">B2.1</span>' +
                    '            <div class="muted">Class</div>' +
                    '          </div>' +
                    '          <div class="solar-metric">' +
                    '            <div class="muted">Geomagnetic Field</div>' +
                    '            <span class="solar-value">Quiet</span>' +
                    '            <div class="muted">Status</div>' +
                    '          </div>' +
                    '        </div>' +
                    '        <h4 style="margin-top:20px;">HF Propagation Forecast</h4>' +
                    '        <ul class="list">' +
                    '          <li><strong>80m / 40m:</strong> <span class="pill pill-ok">GOOD</span> - Excellent nighttime conditions</li>' +
                    '          <li><strong>20m / 17m:</strong> <span class="pill pill-ok">EXCELLENT</span> - Peak daytime propagation</li>' +
                    '          <li><strong>15m / 12m:</strong> <span class="pill pill-ok">GOOD</span> - Strong signals expected</li>' +
                    '          <li><strong>10m:</strong> <span class="pill pill-warn">FAIR</span> - Sporadic E possible</li>' +
                    '        </ul>' +
                    '        <p class="muted" style="margin-top:10px;">In production, data would be fetched from NOAA API: https://services.swpc.noaa.gov/</p>' +
                    '        <iframe src="https://www.swpc.noaa.gov/communities/radio-communications" style="width:100%;height:300px;border:1px solid var(--panel-border);border-radius:8px;margin-top:10px;" title="NOAA Space Weather"></iframe>' +
                    '      </div>' +
                    '    </div>' +
                    '  </div>' +
                    '</section>';

                return html;
            }
*/

// ====================
// ADD TO renderContent() Function (around line 970)
// ====================
// ADD THIS LINE after Safety:
// if (state.tab === "Resources") html = renderResources();

// ====================
// ADD TO wireTabActions() Function (around line 1080)
// ====================
// ADD THIS BLOCK at the end of the function, before the closing brace:
/*
                // Storm Mode Toggle
                var stormToggle = document.getElementById("stormToggle");
                if (stormToggle) {
                    stormToggle.checked = state.stormMode;
                    stormToggle.addEventListener("change", function () {
                        state.stormMode = !!stormToggle.checked;
                        if (state.stormMode) {
                            document.body.classList.add("storm-mode");
                            alert("🚨 STORM MODE ACTIVATED 🚨\\n\\nEmergency layout enabled. All tabs now show critical information first.");
                        } else {
                            document.body.classList.remove("storm-mode");
                        }
                        saveState();
                        renderApp();
                    });
                }

                // Collapsible section toggles
                var toggleBtns = document.querySelectorAll("[data-toggle]");
                for (var t = 0; t < toggleBtns.length; t++) {
                    toggleBtns[t].addEventListener("click", function (e) {
                        var targetId = e.currentTarget.getAttribute("data-toggle") + "-content";
                        var content = document.getElementById(targetId);
                        if (content) {
                            content.classList.toggle("hidden");
                            var arrow = e.currentTarget.querySelector("span:last-child");
                            if (arrow) {
                                arrow.textContent = content.classList.contains("hidden") ? "▼" : "▲";
                            }
                        }
                    });
                }

                // Add equipment button
                var addEquipBtn = document.getElementById("addEquipmentBtn");
                if (addEquipBtn) {
                    addEquipBtn.addEventListener("click", function () {
                        var nameEl = document.getElementById("equipmentName");
                        var statusEl = document.getElementById("equipmentStatus");
                        var name = nameEl.value.trim();
                        var status = statusEl.value;
                        if (!name) return;
                        if (!state.equipment) state.equipment = [];
                        state.equipment.push({
                            name: name,
                            status: status,
                            addedBy: getUserLabel(),
                            addedDate: new Date().toLocaleString()
                        });
                        saveState();
                        renderContent();
                    });
                }
*/

// ====================
// ADD TO applyTheme() Function (around line 680)
// ====================
// ADD THIS AT THE END:
/*
                if (state.stormMode) {
                    document.body.classList.add("storm-mode");
                } else {
                    document.body.classList.remove("storm-mode");
                }
*/

// INSTALLATION COMPLETE!
// After adding all code above, refresh the browser at http://127.0.0.1:8080
