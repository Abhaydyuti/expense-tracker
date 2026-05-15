// public/js/charts.js
// Builds all Chart.js charts from data passed by the server.
// chartData must be defined in the page before this script loads.

// ── Shared colour palette ──────────────────────────────────────
// Used consistently across bar, doughnut, and category table
const PALETTE = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
  '#9c755f', '#bab0ac'
];

// ── Shared Chart.js defaults ───────────────────────────────────
Chart.defaults.font.family = "'Segoe UI', sans-serif";
Chart.defaults.font.size   = 13;
Chart.defaults.color       = '#666';

// ── Helper: format number as ₹ ────────────────────────────────
const toINR = (val) => `₹${parseFloat(val).toFixed(2)}`;

// ══════════════════════════════════════════════════════════════
// BAR CHART — Monthly Spending
// ══════════════════════════════════════════════════════════════
const barCanvas = document.getElementById('barChart');

if (barCanvas && chartData.monthly.labels.length > 0) {
  new Chart(barCanvas, {
    type: 'bar',
    data: {
      labels:   chartData.monthly.labels,
      datasets: [{
        label:           'Total Spent',
        data:            chartData.monthly.values,
        backgroundColor: chartData.monthly.values.map((_, i) =>
          i === chartData.monthly.values.length - 1
            ? '#4e79a7'      // current month — solid blue
            : 'rgba(78,121,167,0.45)'  // past months — lighter
        ),
        borderColor:     '#4e79a7',
        borderWidth:     1,
        borderRadius:    8,
        borderSkipped:   false
      }]
    },
    options: {
      responsive:          true,
      maintainAspectRatio: true,
      animation: {
        duration: 800,
        easing:   'easeOutQuart'
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#333',
          padding:         10,
          callbacks: {
            label: (ctx) => `  Spent: ${toINR(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            callback: (val) => `₹${val}`
          }
        }
      }
    }
  });
}

// ══════════════════════════════════════════════════════════════
// DOUGHNUT CHART — Category Breakdown
// ══════════════════════════════════════════════════════════════
const doughnutCanvas = document.getElementById('doughnutChart');

if (doughnutCanvas && chartData.categories.labels.length > 0) {
  new Chart(doughnutCanvas, {
    type: 'doughnut',
    data: {
      labels:   chartData.categories.labels,
      datasets: [{
        data:            chartData.categories.values,
        backgroundColor: PALETTE.slice(0, chartData.categories.labels.length),
        borderWidth:     3,
        borderColor:     '#fff',
        hoverOffset:     8
      }]
    },
    options: {
      responsive:          true,
      maintainAspectRatio: true,
      cutout:              '65%',   // makes it a thinner ring
      animation: {
        animateRotate: true,
        duration:      900
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth:    12,
            borderRadius: 6,
            padding:     12,
            usePointStyle: true,
            pointStyle:  'circle'
          }
        },
        tooltip: {
          backgroundColor: '#333',
          padding:         10,
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct   = ((ctx.parsed / total) * 100).toFixed(1);
              return `  ${toINR(ctx.parsed)}  (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// ══════════════════════════════════════════════════════════════
// LINE CHART — Daily Spending This Month
// ══════════════════════════════════════════════════════════════
const lineCanvas = document.getElementById('lineChart');

if (lineCanvas && chartData.daily && chartData.daily.labels.length > 0) {
  new Chart(lineCanvas, {
    type: 'line',
    data: {
      labels:   chartData.daily.labels,
      datasets: [{
        label:           'Daily Spend',
        data:            chartData.daily.values,
        borderColor:     '#59a14f',
        backgroundColor: 'rgba(89,161,79,0.12)',
        borderWidth:     2.5,
        pointRadius:     4,
        pointBackgroundColor: '#59a14f',
        pointHoverRadius:     6,
        fill:            true,
        tension:         0.35   // smooth curve
      }]
    },
    options: {
      responsive:          true,
      maintainAspectRatio: true,
      animation: {
        duration: 900,
        easing:   'easeOutCubic'
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#333',
          padding:         10,
          callbacks: {
            title: (items) => `Day ${items[0].label}`,
            label: (ctx)   => `  Spent: ${toINR(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            // Only show every 5th day label to avoid crowding
            callback: (val, i) => (i % 5 === 0 || i === 0) ? `${i + 1}` : ''
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            callback: (val) => `₹${val}`
          }
        }
      }
    }
  });
}

// ══════════════════════════════════════════════════════════════
// HORIZONTAL BAR — Category Comparison (Reports page only)
// ══════════════════════════════════════════════════════════════
const hBarCanvas = document.getElementById('categoryBarChart');

if (hBarCanvas && chartData.categories.labels.length > 0) {
  new Chart(hBarCanvas, {
    type: 'bar',
    data: {
      labels:   chartData.categories.labels,
      datasets: [{
        label:           'Total Spent',
        data:            chartData.categories.values,
        backgroundColor: PALETTE.slice(0, chartData.categories.labels.length),
        borderRadius:    6,
        borderSkipped:   false
      }]
    },
    options: {
      indexAxis: 'y',   // makes it horizontal
      responsive:          true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing:   'easeOutQuart'
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#333',
          padding:         10,
          callbacks: {
            label: (ctx) => `  ${toINR(ctx.parsed.x)}`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { callback: (val) => `₹${val}` }
        },
        y: {
          grid: { display: false }
        }
      }
    }
  });
}

// ══════════════════════════════════════════════════════════════
// ANIMATED COUNTERS — Dashboard summary cards
// ══════════════════════════════════════════════════════════════
// Counts up from 0 to the target number when the page loads
const animateCounter = (el, target, duration = 1000) => {
  const start     = 0;
  const startTime = performance.now();

  const step = (currentTime) => {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out — fast at start, slow at end
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = start + (target - start) * eased;

    el.textContent = `₹${current.toFixed(2)}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = `₹${target.toFixed(2)}`; // ensure exact final value
    }
  };

  requestAnimationFrame(step);
};

// Find all elements with data-counter attribute and animate them
document.querySelectorAll('[data-counter]').forEach(el => {
  const target = parseFloat(el.dataset.counter);
  if (!isNaN(target)) {
    animateCounter(el, target);
  }
});