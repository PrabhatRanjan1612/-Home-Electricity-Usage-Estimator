/**
 * ====================================================================
 * HOME ELECTRICITY USAGE ESTIMATOR — JAVASCRIPT CONTROLLER
 * Architecture: Modular Vanilla ES6+ (No Framework Dependencies)
 * Implements Complete System Flow, Error Handling Loops & LocalStorage
 * ====================================================================
 */

(function () {
  'use strict';

  // Storage Key Constant
  const STORAGE_KEY = 'home_electricity_estimator_v1';

  // Application State
  const state = {
    currency: '₹',
    electricityRate: 7.50,
    appliances: []
  };

  // DOM Element Selectors Cache
  const DOM = {
    currencySelect: document.getElementById('currencySelect'),
    currencySymbolLabel: document.getElementById('currencySymbolLabel'),
    electricityRateInput: document.getElementById('electricityRateInput'),
    saveRateBtn: document.getElementById('saveRateBtn'),
    rateCard: document.getElementById('rateCard'),
    rateErrorMsg: document.getElementById('rateErrorMsg'),
    kpiRateSubtext: document.getElementById('kpiRateSubtext'),
    storageStatusBadge: document.getElementById('storageStatusBadge'),

    // Appliance Form
    applianceForm: document.getElementById('applianceForm'),
    applianceName: document.getElementById('applianceName'),
    powerWatts: document.getElementById('powerWatts'),
    quantity: document.getElementById('quantity'),
    hoursPerDay: document.getElementById('hoursPerDay'),
    hoursRange: document.getElementById('hoursRange'),
    clearFormBtn: document.getElementById('clearFormBtn'),
    presetChips: document.querySelectorAll('.preset-chip'),

    // Error Labels
    nameError: document.getElementById('nameError'),
    powerError: document.getElementById('powerError'),
    quantityError: document.getElementById('quantityError'),
    hoursError: document.getElementById('hoursError'),

    // Item Live Preview
    previewDaily: document.getElementById('previewDaily'),
    previewMonthly: document.getElementById('previewMonthly'),
    previewCost: document.getElementById('previewCost'),

    // Dashboard KPIs
    totalDailyKWh: document.getElementById('totalDailyKWh'),
    totalMonthlyKWh: document.getElementById('totalMonthlyKWh'),
    totalMonthlyCost: document.getElementById('totalMonthlyCost'),
    highestConsumerName: document.getElementById('highestConsumerName'),
    highestConsumerStat: document.getElementById('highestConsumerStat'),
    usageLevelBadge: document.getElementById('usageLevelBadge'),
    usageGaugeBar: document.getElementById('usageGaugeBar'),
    usageLevelDesc: document.getElementById('usageLevelDesc'),

    // Suggestions & Chart
    suggestionsList: document.getElementById('suggestionsList'),
    chartContainer: document.getElementById('chartContainer'),

    // Table
    appliancesTable: document.getElementById('appliancesTable'),
    applianceTableBody: document.getElementById('applianceTableBody'),
    emptyState: document.getElementById('emptyState'),
    applianceCountBadge: document.getElementById('applianceCountBadge'),

    // Action Bar Buttons
    openWhatIfBtn: document.getElementById('openWhatIfBtn'),
    openCompareBtn: document.getElementById('openCompareBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    resetDataBtn: document.getElementById('resetDataBtn'),

    // What-If Dialog
    whatIfDialog: document.getElementById('whatIfDialog'),
    closeWhatIfBtn: document.getElementById('closeWhatIfBtn'),
    cancelWhatIfBtn: document.getElementById('cancelWhatIfBtn'),
    whatIfForm: document.getElementById('whatIfForm'),
    whatIfApplianceSelect: document.getElementById('whatIfApplianceSelect'),
    whatIfCurrentHours: document.getElementById('whatIfCurrentHours'),
    whatIfNewHours: document.getElementById('whatIfNewHours'),
    whatIfHoursError: document.getElementById('whatIfHoursError'),
    whatIfCurrentKWh: document.getElementById('whatIfCurrentKWh'),
    whatIfNewKWh: document.getElementById('whatIfNewKWh'),
    whatIfSavedKWh: document.getElementById('whatIfSavedKWh'),
    whatIfSavedCost: document.getElementById('whatIfSavedCost'),
    whatIfAnnualProjection: document.getElementById('whatIfAnnualProjection'),

    // Compare Dialog
    compareDialog: document.getElementById('compareDialog'),
    closeCompareBtn: document.getElementById('closeCompareBtn'),
    cancelCompareBtn: document.getElementById('cancelCompareBtn'),
    compareAppliance1: document.getElementById('compareAppliance1'),
    compareAppliance2: document.getElementById('compareAppliance2'),
    compareResultsArea: document.getElementById('compareResultsArea'),

    // Reset Dialog
    resetDialog: document.getElementById('resetDialog'),
    closeResetBtn: document.getElementById('closeResetBtn'),
    cancelResetBtn: document.getElementById('cancelResetBtn'),
    confirmResetBtn: document.getElementById('confirmResetBtn'),

    // Toasts
    toastContainer: document.getElementById('toastContainer')
  };

  /**
   * ====================================================================
   * 1. CORE MATHEMATICAL CALCULATION ENGINE
   * ====================================================================
   */

  // Daily kWh = Power × Quantity × Hours per Day ÷ 1000
  function calculateDailyKWh(powerWatts, quantity, hoursPerDay) {
    return (powerWatts * quantity * hoursPerDay) / 1000;
  }

  // Monthly kWh = Daily kWh × 30
  function calculateMonthlyKWh(dailyKWh) {
    return dailyKWh * 30;
  }

  // Estimated Electricity Cost = Monthly kWh × Electricity Rate
  function calculateMonthlyCost(monthlyKWh, unitRate) {
    return monthlyKWh * unitRate;
  }

  // Calculate full metrics object for an appliance
  function computeApplianceMetrics(app) {
    const dailyKWh = calculateDailyKWh(app.power, app.quantity, app.hours);
    const monthlyKWh = calculateMonthlyKWh(dailyKWh);
    const monthlyCost = calculateMonthlyCost(monthlyKWh, state.electricityRate);
    return {
      dailyKWh: parseFloat(dailyKWh.toFixed(3)),
      monthlyKWh: parseFloat(monthlyKWh.toFixed(2)),
      monthlyCost: parseFloat(monthlyCost.toFixed(2))
    };
  }

  /**
   * ====================================================================
   * 2. INPUT VALIDATION & ERROR HANDLING LOGIC
   * ====================================================================
   */

  // Clear all form validation error indicators
  function clearFormErrors() {
    [DOM.applianceName, DOM.powerWatts, DOM.quantity, DOM.hoursPerDay].forEach(input => {
      input.classList.remove('is-invalid');
    });
    DOM.nameError.textContent = '';
    DOM.powerError.textContent = '';
    DOM.quantityError.textContent = '';
    DOM.hoursError.textContent = '';
  }

  // Clear electricity rate error
  function clearRateError() {
    DOM.electricityRateInput.classList.remove('is-invalid');
    DOM.rateErrorMsg.textContent = '';
  }

  // Validate Electricity Rate: Rate must be numeric and > 0
  function validateElectricityRate(rateVal) {
    clearRateError();
    if (isNaN(rateVal) || rateVal === '' || Number(rateVal) <= 0) {
      DOM.electricityRateInput.classList.add('is-invalid');
      DOM.rateErrorMsg.textContent = 'Please enter a valid positive electricity rate.';
      DOM.electricityRateInput.focus();
      showToast('Validation Error: Rate must be greater than 0', 'error');
      return false;
    }
    return true;
  }

  // Validate Appliance Form Inputs (Error Handling Loop)
  function validateApplianceInputs(name, power, quantity, hours) {
    clearFormErrors();
    let isValid = true;
    let firstInvalidInput = null;

    // 1. Validate Appliance Name
    if (!name || name.trim() === '') {
      DOM.applianceName.classList.add('is-invalid');
      DOM.nameError.textContent = 'Please enter an appliance name.';
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = DOM.applianceName;
    }

    // 2. Validate Power in Watts (Power must be > 0)
    if (isNaN(power) || power === '' || Number(power) <= 0) {
      DOM.powerWatts.classList.add('is-invalid');
      DOM.powerError.textContent = 'Power must be greater than 0 Watts.';
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = DOM.powerWatts;
    }

    // 3. Validate Quantity (Quantity must be >= 1)
    if (isNaN(quantity) || quantity === '' || Number(quantity) < 1) {
      DOM.quantity.classList.add('is-invalid');
      DOM.quantityError.textContent = 'Quantity must be at least 1.';
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = DOM.quantity;
    }

    // 4. Validate Hours per Day (Hours must be between 0 and 24)
    if (isNaN(hours) || hours === '' || Number(hours) < 0 || Number(hours) > 24) {
      DOM.hoursPerDay.classList.add('is-invalid');
      DOM.hoursError.textContent = 'Hours per day must be between 0 and 24.';
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = DOM.hoursPerDay;
    }

    // If invalid: highlight field and focus for user correction
    if (!isValid) {
      showToast('Please correct highlighted fields before adding.', 'error');
      if (firstInvalidInput) firstInvalidInput.focus();
    }

    return isValid;
  }

  // Validate What-If Hours: Hours between 0 and 24
  function validateWhatIfHours(hoursVal) {
    DOM.whatIfNewHours.classList.remove('is-invalid');
    DOM.whatIfHoursError.textContent = '';

    if (isNaN(hoursVal) || hoursVal === '' || Number(hoursVal) < 0 || Number(hoursVal) > 24) {
      DOM.whatIfNewHours.classList.add('is-invalid');
      DOM.whatIfHoursError.textContent = 'Hours must be between 0 and 24.';
      DOM.whatIfNewHours.focus();
      showToast('What-If Error: Hours must be between 0 and 24.', 'error');
      return false;
    }
    return true;
  }

  /**
   * ====================================================================
   * 3. LOCALSTORAGE PERSISTENCE ENGINE
   * ====================================================================
   */

  function saveToLocalStorage() {
    try {
      const payload = {
        currency: state.currency,
        electricityRate: state.electricityRate,
        appliances: state.appliances,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      
      DOM.storageStatusBadge.textContent = '🗄️ LocalStorage Synced';
      DOM.storageStatusBadge.className = 'badge badge-success';
    } catch (err) {
      console.error('LocalStorage write failed:', err);
      DOM.storageStatusBadge.textContent = '⚠️ Storage Error';
      DOM.storageStatusBadge.className = 'badge badge-danger';
    }
  }

  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.currency) state.currency = parsed.currency;
        if (parsed.electricityRate && Number(parsed.electricityRate) > 0) {
          state.electricityRate = Number(parsed.electricityRate);
        }
        if (Array.isArray(parsed.appliances)) {
          state.appliances = parsed.appliances;
        }
        return true;
      }
    } catch (err) {
      console.warn('LocalStorage read error, initializing defaults:', err);
    }
    return false;
  }

  // Load default demo appliances for MCA presentation if first launch
  function loadDemoData() {
    state.appliances = [
      {
        id: 'app_' + Date.now() + '_1',
        name: 'Inverter Air Conditioner (1.5 Ton)',
        power: 1500,
        quantity: 1,
        hours: 8
      },
      {
        id: 'app_' + Date.now() + '_2',
        name: 'Frost-Free Refrigerator',
        power: 250,
        quantity: 1,
        hours: 24
      },
      {
        id: 'app_' + Date.now() + '_3',
        name: 'BLDC Ceiling Fan',
        power: 35,
        quantity: 3,
        hours: 14
      },
      {
        id: 'app_' + Date.now() + '_4',
        name: 'Smart LED TV 55"',
        power: 100,
        quantity: 1,
        hours: 6
      }
    ];
    saveToLocalStorage();
  }

  /**
   * ====================================================================
   * 4. DASHBOARD RENDERING & ANALYTICS
   * ====================================================================
   */

  function updateDashboard() {
    let totalDailyKWh = 0;
    let totalMonthlyKWh = 0;
    let totalMonthlyCost = 0;

    // Recalculate metrics for all appliances
    const enrichedList = state.appliances.map(app => {
      const metrics = computeApplianceMetrics(app);
      totalDailyKWh += metrics.dailyKWh;
      totalMonthlyKWh += metrics.monthlyKWh;
      totalMonthlyCost += metrics.monthlyCost;
      return { ...app, ...metrics };
    });

    // 1. Update KPI Card 1 & 2: Daily & Monthly Consumption
    DOM.totalDailyKWh.textContent = totalDailyKWh.toFixed(2);
    DOM.totalMonthlyKWh.textContent = totalMonthlyKWh.toFixed(2);

    // 2. Update KPI Card 3: Estimated Monthly Bill
    DOM.totalMonthlyCost.textContent = `${state.currency}${totalMonthlyCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    DOM.kpiRateSubtext.textContent = `At ${state.currency}${state.electricityRate.toFixed(2)} per unit`;

    // 3. Update KPI Card 4: Highest Energy Consumer
    if (enrichedList.length > 0) {
      const highest = enrichedList.reduce((prev, curr) => (curr.monthlyKWh > prev.monthlyKWh ? curr : prev), enrichedList[0]);
      const percentage = totalMonthlyKWh > 0 ? ((highest.monthlyKWh / totalMonthlyKWh) * 100).toFixed(1) : 0;
      DOM.highestConsumerName.textContent = highest.name;
      DOM.highestConsumerName.title = highest.name;
      DOM.highestConsumerStat.textContent = `${highest.monthlyKWh.toFixed(1)} kWh/mo (${percentage}% of bill)`;
    } else {
      DOM.highestConsumerName.textContent = 'None';
      DOM.highestConsumerStat.textContent = '0.00 kWh/mo (0%)';
    }

    // 4. Update KPI Card 5: Energy Usage Level & Gauge
    updateUsageLevel(totalMonthlyKWh);

    // 5. Update Recommendations
    generateRecommendations(enrichedList, totalMonthlyKWh);

    // 6. Render Visual Breakdown Chart
    renderBreakdownChart(enrichedList, totalMonthlyKWh);

    // 7. Render Inventory Table
    renderAppliancesTable(enrichedList, totalMonthlyKWh);

    // 8. Update Counter Badge
    DOM.applianceCountBadge.textContent = `${state.appliances.length} Appliance${state.appliances.length === 1 ? '' : 's'}`;

    // Sync state
    saveToLocalStorage();
  }

  // Energy Usage Level Classifier: Low (<150), Moderate (150-300), High (>300)
  function updateUsageLevel(totalMonthlyKWh) {
    let levelText = 'Low Usage';
    let levelClass = 'badge-low';
    let barColor = 'var(--success)';
    let gaugePercent = 10;
    let desc = '< 150 kWh/mo (Energy Efficient)';

    if (totalMonthlyKWh === 0) {
      levelText = 'No Load';
      gaugePercent = 0;
      desc = '0 kWh/mo';
    } else if (totalMonthlyKWh < 150) {
      levelText = 'Low Usage';
      levelClass = 'badge-low';
      barColor = 'var(--success)';
      gaugePercent = Math.max(15, (totalMonthlyKWh / 150) * 33);
      desc = '< 150 kWh/mo (Energy Efficient)';
    } else if (totalMonthlyKWh <= 300) {
      levelText = 'Moderate Usage';
      levelClass = 'badge-moderate';
      barColor = 'var(--warning)';
      gaugePercent = 33 + ((totalMonthlyKWh - 150) / 150) * 33;
      desc = '150 – 300 kWh/mo (Typical Household)';
    } else {
      levelText = 'High Usage';
      levelClass = 'badge-high';
      barColor = 'var(--danger)';
      gaugePercent = Math.min(100, 66 + ((totalMonthlyKWh - 300) / 300) * 34);
      desc = '> 300 kWh/mo (High Tariff Slab)';
    }

    DOM.usageLevelBadge.textContent = levelText;
    DOM.usageLevelBadge.className = `usage-badge ${levelClass}`;
    DOM.usageGaugeBar.style.width = `${gaugePercent}%`;
    DOM.usageGaugeBar.style.backgroundColor = barColor;
    DOM.usageLevelDesc.textContent = desc;
  }

  // Generate Contextual Energy-Saving Suggestions
  function generateRecommendations(appliances, totalMonthlyKWh) {
    DOM.suggestionsList.innerHTML = '';

    if (appliances.length === 0) {
      DOM.suggestionsList.innerHTML = '<li><span class="sug-icon">ℹ️</span> Add appliances to receive tailored energy efficiency tips.</li>';
      return;
    }

    const tips = [];

    // Check for Air Conditioner
    const acApp = appliances.find(a => /ac|air conditioner|cooling/i.test(a.name));
    if (acApp) {
      tips.push({
        icon: '❄️',
        text: `Your "${acApp.name}" runs ${acApp.hours}h/day. Increasing thermostat temperature from 18°C to 24°C can save 20–25% on cooling expenses.`
      });
    }

    // Check for Water Heater / Geyser
    const geyserApp = appliances.find(a => /geyser|water heater|boiler/i.test(a.name));
    if (geyserApp && geyserApp.hours > 1.5) {
      tips.push({
        icon: '🚿',
        text: `Your "${geyserApp.name}" consumes ${geyserApp.power}W. Installing a digital timer switch to limit heating to 30 mins before showers saves significant standby heat loss.`
      });
    }

    // Check for high power consumption appliances (> 1000W)
    const heavyApp = appliances.find(a => a.power >= 1000 && !/ac|air conditioner/i.test(a.name));
    if (heavyApp) {
      tips.push({
        icon: '⚡',
        text: `"${heavyApp.name}" is a heavy electrical load (${heavyApp.power}W). Running high-wattage loads outside peak tariff hours reduces grid stress.`
      });
    }

    // Usage Level General Advice
    if (totalMonthlyKWh > 300) {
      tips.push({
        icon: '⚠️',
        text: `Your total consumption (${totalMonthlyKWh.toFixed(1)} kWh) exceeds 300 units/month, pushing billing into higher tariff slabs. Use the What-If Calculator to plan runtime cutbacks.`
      });
    } else {
      tips.push({
        icon: '🌿',
        text: 'Regular maintenance (cleaning refrigerator coils, AC air filters, and ceiling fan blades) maintains 10–15% higher motor efficiency.'
      });
    }

    tips.forEach(tip => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="sug-icon">${tip.icon}</span> <span>${tip.text}</span>`;
      DOM.suggestionsList.appendChild(li);
    });
  }

  // Render Visual Breakdown Progress Bars
  function renderBreakdownChart(appliances, totalMonthlyKWh) {
    DOM.chartContainer.innerHTML = '';

    if (appliances.length === 0 || totalMonthlyKWh === 0) {
      DOM.chartContainer.innerHTML = '<p class="empty-state-text">Add appliances to view graphical energy share.</p>';
      return;
    }

    // Sort descending by monthly kWh
    const sorted = [...appliances].sort((a, b) => b.monthlyKWh - a.monthlyKWh);

    sorted.forEach(app => {
      const sharePercent = ((app.monthlyKWh / totalMonthlyKWh) * 100).toFixed(1);

      const row = document.createElement('div');
      row.className = 'chart-row';
      row.innerHTML = `
        <div class="chart-label-flex">
          <span>${escapeHtml(app.name)}</span>
          <span><strong>${app.monthlyKWh.toFixed(1)} kWh</strong> (${sharePercent}%)</span>
        </div>
        <div class="chart-progress-bg">
          <div class="chart-progress-fill" style="width: ${Math.max(3, sharePercent)}%;"></div>
        </div>
      `;
      DOM.chartContainer.appendChild(row);
    });
  }

  // Render Appliance Inventory Table
  function renderAppliancesTable(appliances, totalMonthlyKWh) {
    DOM.applianceTableBody.innerHTML = '';

    if (appliances.length === 0) {
      DOM.appliancesTable.style.display = 'none';
      DOM.emptyState.classList.add('is-visible');
      return;
    }

    DOM.appliancesTable.style.display = 'table';
    DOM.emptyState.classList.remove('is-visible');

    appliances.forEach((app, index) => {
      const share = totalMonthlyKWh > 0 ? ((app.monthlyKWh / totalMonthlyKWh) * 100).toFixed(1) : 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${escapeHtml(app.name)}</strong></td>
        <td class="num-cell">${app.power} W</td>
        <td class="num-cell">${app.quantity}</td>
        <td class="num-cell">${app.hours} hrs</td>
        <td class="num-cell">${app.dailyKWh.toFixed(2)}</td>
        <td class="num-cell">${app.monthlyKWh.toFixed(2)}</td>
        <td class="num-cell"><strong>${state.currency}${app.monthlyCost.toFixed(2)}</strong></td>
        <td><span class="badge badge-info">${share}%</span></td>
        <td class="table-actions-cell text-right">
          <button type="button" class="btn-icon whatif-btn" data-id="${app.id}" title="Run What-If analysis on this appliance">
            🔮 What-If
          </button>
          <button type="button" class="btn-icon delete-btn" data-id="${app.id}" title="Delete appliance">
            🗑️ Delete
          </button>
        </td>
      `;
      DOM.applianceTableBody.appendChild(tr);
    });
  }

  // Update Live Item Preview Box in Form
  function updateLiveItemPreview() {
    const power = parseFloat(DOM.powerWatts.value) || 0;
    const qty = parseInt(DOM.quantity.value, 10) || 1;
    const hours = parseFloat(DOM.hoursPerDay.value) || 0;

    const dailyKWh = calculateDailyKWh(power, qty, hours);
    const monthlyKWh = calculateMonthlyKWh(dailyKWh);
    const monthlyCost = calculateMonthlyCost(monthlyKWh, state.electricityRate);

    DOM.previewDaily.textContent = `${dailyKWh.toFixed(2)} kWh`;
    DOM.previewMonthly.textContent = `${monthlyKWh.toFixed(2)} kWh`;
    DOM.previewCost.textContent = `${state.currency}${monthlyCost.toFixed(2)}`;
  }

  /**
   * ====================================================================
   * 5. EVENT LISTENERS & USER ACTION DISPATCHER
   * ====================================================================
   */

  function setupEventListeners() {
    // 1. Currency Change
    DOM.currencySelect.addEventListener('change', (e) => {
      state.currency = e.target.value;
      DOM.currencySymbolLabel.textContent = state.currency;
      updateLiveItemPreview();
      updateDashboard();
      showToast(`Currency changed to ${state.currency}`, 'info');
    });

    // 2. Electricity Rate Update
    DOM.saveRateBtn.addEventListener('click', () => {
      const val = parseFloat(DOM.electricityRateInput.value);
      if (validateElectricityRate(val)) {
        state.electricityRate = val;
        updateLiveItemPreview();
        updateDashboard();
        showToast(`Electricity rate updated to ${state.currency}${state.electricityRate.toFixed(2)}/kWh`, 'success');
      }
    });

    // Clear rate error on typing
    DOM.electricityRateInput.addEventListener('input', clearRateError);

    // 3. Quick Preset Chips
    DOM.presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        DOM.applianceName.value = chip.dataset.name;
        DOM.powerWatts.value = chip.dataset.power;
        DOM.hoursPerDay.value = chip.dataset.hours;
        DOM.hoursRange.value = chip.dataset.hours;
        DOM.quantity.value = 1;
        clearFormErrors();
        updateLiveItemPreview();
        DOM.applianceName.focus();
        showToast(`Loaded preset: ${chip.dataset.name}`, 'info');
      });
    });

    // 4. Hours Input / Range Synchronizer
    DOM.hoursPerDay.addEventListener('input', (e) => {
      DOM.hoursRange.value = e.target.value;
      updateLiveItemPreview();
    });

    DOM.hoursRange.addEventListener('input', (e) => {
      DOM.hoursPerDay.value = e.target.value;
      updateLiveItemPreview();
    });

    // Live preview triggers
    [DOM.powerWatts, DOM.quantity].forEach(el => {
      el.addEventListener('input', updateLiveItemPreview);
    });

    // 5. Appliance Form Submission (Add Appliance)
    DOM.applianceForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = DOM.applianceName.value.trim();
      const power = parseFloat(DOM.powerWatts.value);
      const qty = parseInt(DOM.quantity.value, 10);
      const hours = parseFloat(DOM.hoursPerDay.value);

      // Execute Error Handling Loop
      if (!validateApplianceInputs(name, power, qty, hours)) {
        return; // Validation failed, error shown, field highlighted
      }

      // Valid Inputs -> Append to state
      const newAppliance = {
        id: 'app_' + Date.now(),
        name: name,
        power: power,
        quantity: qty,
        hours: hours
      };

      state.appliances.push(newAppliance);
      updateDashboard();
      resetApplianceForm();
      showToast(`Added "${name}" successfully!`, 'success');
    });

    // Clear form button
    DOM.clearFormBtn.addEventListener('click', resetApplianceForm);

    // 6. Table Action Delegations (Delete & What-If)
    DOM.applianceTableBody.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-btn');
      const whatIfBtn = e.target.closest('.whatif-btn');

      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        deleteAppliance(id);
      } else if (whatIfBtn) {
        const id = whatIfBtn.dataset.id;
        openWhatIfModalForAppliance(id);
      }
    });

    // 7. What-If Modal Controls
    DOM.openWhatIfBtn.addEventListener('click', () => {
      if (state.appliances.length === 0) {
        showToast('Please add at least one appliance first.', 'info');
        return;
      }
      populateWhatIfDropdown();
      DOM.whatIfDialog.showModal();
    });

    DOM.closeWhatIfBtn.addEventListener('click', () => DOM.whatIfDialog.close());
    DOM.cancelWhatIfBtn.addEventListener('click', () => DOM.whatIfDialog.close());

    DOM.whatIfApplianceSelect.addEventListener('change', handleWhatIfApplianceChange);

    DOM.whatIfForm.addEventListener('submit', (e) => {
      e.preventDefault();
      executeWhatIfCalculation();
    });

    // 8. Compare Modal Controls
    DOM.openCompareBtn.addEventListener('click', () => {
      if (state.appliances.length < 2) {
        showToast('Please add at least 2 appliances to compare.', 'info');
        return;
      }
      populateCompareDropdowns();
      renderComparisonResults();
      DOM.compareDialog.showModal();
    });

    DOM.closeCompareBtn.addEventListener('click', () => DOM.compareDialog.close());
    DOM.cancelCompareBtn.addEventListener('click', () => DOM.compareDialog.close());
    DOM.compareAppliance1.addEventListener('change', renderComparisonResults);
    DOM.compareAppliance2.addEventListener('change', renderComparisonResults);

    // 9. Reset Modal Controls
    DOM.resetDataBtn.addEventListener('click', () => {
      DOM.resetDialog.showModal();
    });

    DOM.closeResetBtn.addEventListener('click', () => DOM.resetDialog.close());
    DOM.cancelResetBtn.addEventListener('click', () => DOM.resetDialog.close());

    DOM.confirmResetBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      state.appliances = [];
      resetApplianceForm();
      updateDashboard();
      DOM.resetDialog.close();
      showToast('All appliance data has been reset.', 'info');
    });

    // 10. Export CSV
    DOM.exportCsvBtn.addEventListener('click', exportDataAsCSV);
  }

  // Delete Appliance Action
  function deleteAppliance(id) {
    const item = state.appliances.find(a => a.id === id);
    const itemName = item ? item.name : 'Appliance';

    state.appliances = state.appliances.filter(a => a.id !== id);
    updateDashboard();
    showToast(`Deleted "${itemName}".`, 'info');
  }

  // Reset form to defaults
  function resetApplianceForm() {
    DOM.applianceForm.reset();
    DOM.quantity.value = 1;
    DOM.hoursPerDay.value = 6;
    DOM.hoursRange.value = 6;
    clearFormErrors();
    updateLiveItemPreview();
    DOM.applianceName.focus();
  }

  /**
   * ====================================================================
   * 6. WHAT-IF CALCULATOR SUB-FLOW
   * ====================================================================
   */

  function populateWhatIfDropdown(selectedId = null) {
    DOM.whatIfApplianceSelect.innerHTML = '';
    state.appliances.forEach(app => {
      const opt = document.createElement('option');
      opt.value = app.id;
      opt.textContent = `${app.name} (${app.power}W, ${app.hours}h/day)`;
      if (selectedId && app.id === selectedId) opt.selected = true;
      DOM.whatIfApplianceSelect.appendChild(opt);
    });

    handleWhatIfApplianceChange();
  }

  function handleWhatIfApplianceChange() {
    const id = DOM.whatIfApplianceSelect.value;
    const app = state.appliances.find(a => a.id === id);
    if (app) {
      DOM.whatIfCurrentHours.value = `${app.hours} hrs/day`;
      DOM.whatIfNewHours.value = Math.max(0, app.hours - 2); // default proposal: 2 hrs less
      DOM.whatIfNewHours.classList.remove('is-invalid');
      DOM.whatIfHoursError.textContent = '';
      executeWhatIfCalculation();
    }
  }

  function openWhatIfModalForAppliance(id) {
    populateWhatIfDropdown(id);
    DOM.whatIfDialog.showModal();
  }

  function executeWhatIfCalculation() {
    const id = DOM.whatIfApplianceSelect.value;
    const app = state.appliances.find(a => a.id === id);
    if (!app) return;

    const newHoursVal = parseFloat(DOM.whatIfNewHours.value);

    // Validate What-If Hours
    if (!validateWhatIfHours(newHoursVal)) {
      return; // Validation failed
    }

    // Compute differences
    const currentDailyKWh = calculateDailyKWh(app.power, app.quantity, app.hours);
    const currentMonthlyKWh = calculateMonthlyKWh(currentDailyKWh);
    const currentMonthlyCost = calculateMonthlyCost(currentMonthlyKWh, state.electricityRate);

    const newDailyKWh = calculateDailyKWh(app.power, app.quantity, newHoursVal);
    const newMonthlyKWh = calculateMonthlyKWh(newDailyKWh);
    const newMonthlyCost = calculateMonthlyCost(newMonthlyKWh, state.electricityRate);

    const savedKWh = currentMonthlyKWh - newMonthlyKWh;
    const savedCost = currentMonthlyCost - newMonthlyCost;
    const annualSavings = savedCost * 12;

    DOM.whatIfCurrentKWh.textContent = `${currentMonthlyKWh.toFixed(2)} kWh`;
    DOM.whatIfNewKWh.textContent = `${newMonthlyKWh.toFixed(2)} kWh`;

    if (savedKWh >= 0) {
      DOM.whatIfSavedKWh.textContent = `-${savedKWh.toFixed(2)} kWh / mo`;
      DOM.whatIfSavedCost.textContent = `${state.currency}${savedCost.toFixed(2)} / mo`;
      DOM.whatIfAnnualProjection.textContent = `🎉 Annual Estimated Savings: ${state.currency}${annualSavings.toFixed(2)} / year!`;
    } else {
      // Increased runtime
      const extraKWh = Math.abs(savedKWh);
      const extraCost = Math.abs(savedCost);
      DOM.whatIfSavedKWh.textContent = `+${extraKWh.toFixed(2)} kWh / mo`;
      DOM.whatIfSavedCost.textContent = `+${state.currency}${extraCost.toFixed(2)} / mo`;
      DOM.whatIfAnnualProjection.textContent = `⚠️ Additional annual cost: ${state.currency}${(extraCost * 12).toFixed(2)} / year.`;
    }
  }

  /**
   * ====================================================================
   * 7. APPLIANCE COMPARISON SUB-FLOW
   * ====================================================================
   */

  function populateCompareDropdowns() {
    DOM.compareAppliance1.innerHTML = '';
    DOM.compareAppliance2.innerHTML = '';

    state.appliances.forEach((app, idx) => {
      const opt1 = document.createElement('option');
      opt1.value = app.id;
      opt1.textContent = app.name;
      if (idx === 0) opt1.selected = true;
      DOM.compareAppliance1.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = app.id;
      opt2.textContent = app.name;
      if (idx === 1 || (state.appliances.length === 1 && idx === 0)) opt2.selected = true;
      DOM.compareAppliance2.appendChild(opt2);
    });
  }

  function renderComparisonResults() {
    const id1 = DOM.compareAppliance1.value;
    const id2 = DOM.compareAppliance2.value;

    const app1 = state.appliances.find(a => a.id === id1);
    const app2 = state.appliances.find(a => a.id === id2);

    if (!app1 || !app2) {
      DOM.compareResultsArea.innerHTML = '<p class="text-muted">Select two appliances above.</p>';
      return;
    }

    const m1 = computeApplianceMetrics(app1);
    const m2 = computeApplianceMetrics(app2);

    const costDiff = Math.abs(m1.monthlyCost - m2.monthlyCost);
    const cheaperName = m1.monthlyCost < m2.monthlyCost ? app1.name : app2.name;

    DOM.compareResultsArea.innerHTML = `
      <div class="compare-col">
        <h4>${escapeHtml(app1.name)}</h4>
        <div class="compare-stat">Power: <strong>${app1.power} Watts</strong></div>
        <div class="compare-stat">Quantity: <strong>${app1.quantity}</strong></div>
        <div class="compare-stat">Hours/Day: <strong>${app1.hours} hrs</strong></div>
        <div class="compare-stat">Monthly kWh: <strong>${m1.monthlyKWh.toFixed(2)} units</strong></div>
        <div class="compare-stat">Monthly Bill: <strong>${state.currency}${m1.monthlyCost.toFixed(2)}</strong></div>
      </div>

      <div class="compare-col">
        <h4>${escapeHtml(app2.name)}</h4>
        <div class="compare-stat">Power: <strong>${app2.power} Watts</strong></div>
        <div class="compare-stat">Quantity: <strong>${app2.quantity}</strong></div>
        <div class="compare-stat">Hours/Day: <strong>${app2.hours} hrs</strong></div>
        <div class="compare-stat">Monthly kWh: <strong>${m2.monthlyKWh.toFixed(2)} units</strong></div>
        <div class="compare-stat">Monthly Bill: <strong>${state.currency}${m2.monthlyCost.toFixed(2)}</strong></div>
      </div>

      <div style="grid-column: 1 / -1; background: var(--purple-light); padding: 12px; border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--purple); font-weight: 600;">
        💡 Difference: <strong>"${escapeHtml(cheaperName)}"</strong> costs <strong>${state.currency}${costDiff.toFixed(2)} less</strong> per month (saves ${state.currency}${(costDiff * 12).toFixed(2)} per year).
      </div>
    `;
  }

  /**
   * ====================================================================
   * 8. CSV DATA EXPORTER
   * ====================================================================
   */

  function exportDataAsCSV() {
    if (state.appliances.length === 0) {
      showToast('No appliances to export.', 'info');
      return;
    }

    const headers = ['Appliance Name', 'Power (Watts)', 'Quantity', 'Hours Per Day', 'Daily kWh', 'Monthly kWh', `Monthly Cost (${state.currency})`];
    const rows = state.appliances.map(app => {
      const m = computeApplianceMetrics(app);
      return [
        `"${app.name.replace(/"/g, '""')}"`,
        app.power,
        app.quantity,
        app.hours,
        m.dailyKWh,
        m.monthlyKWh,
        m.monthlyCost
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `electricity_estimator_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report exported as CSV file.', 'success');
  }

  /**
   * ====================================================================
   * 9. TOAST NOTIFICATION UTILITY
   * ====================================================================
   */

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'error') icon = '🚨';
    if (type === 'success') icon = '✅';

    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Safe HTML Escaping
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * ====================================================================
   * 10. BOOTSTRAP APPLICATION
   * ====================================================================
   */

  function init() {
    const hasData = loadFromLocalStorage();
    if (!hasData || state.appliances.length === 0) {
      loadDemoData();
    }

    // Set UI initial values
    DOM.currencySelect.value = state.currency;
    DOM.currencySymbolLabel.textContent = state.currency;
    DOM.electricityRateInput.value = state.electricityRate;

    setupEventListeners();
    updateLiveItemPreview();
    updateDashboard();

    console.log('⚡ Home Electricity Usage Estimator initialized successfully.');
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
