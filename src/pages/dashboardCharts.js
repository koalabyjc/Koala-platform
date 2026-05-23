/* ============================================
   KOALA — Dashboard Charts
   Chart.js initialization for Revenue & Donut
   ============================================ */

import { Chart, registerables } from 'chart.js';
import { dashboardData } from '../data/mockData.js';

Chart.register(...registerables);

export function initCharts() {
  initRevenueChart();
}

function initRevenueChart() {
  const canvas = document.getElementById('revenueChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const { labels, revenue, expenses } = dashboardData.revenueChart;

  /* Gradient for revenue line */
  const revenueGradient = ctx.createLinearGradient(0, 0, 0, 250);
  revenueGradient.addColorStop(0, 'rgba(43, 34, 28, 0.12)');
  revenueGradient.addColorStop(1, 'rgba(43, 34, 28, 0)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: revenue,
          borderColor: '#2B221C',
          backgroundColor: revenueGradient,
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#2B221C',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointHoverRadius: 6
        },
        {
          label: 'Gastos',
          data: expenses,
          borderColor: '#C6A27A',
          borderWidth: 2,
          borderDash: [6, 4],
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#C6A27A',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#2A211B',
          titleColor: '#FFFFFF',
          bodyColor: 'rgba(255,255,255,0.8)',
          borderColor: 'rgba(198, 162, 122, 0.3)',
          borderWidth: 1,
          cornerRadius: 10,
          padding: 12,
          titleFont: { family: 'Inter', size: 12, weight: '600' },
          bodyFont: { family: 'Inter', size: 11 },
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: $${(context.parsed.y / 1000).toFixed(0)}K`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#A29284',
            font: { family: 'Inter', size: 11 }
          },
          border: { display: false }
        },
        y: {
          grid: {
            color: 'rgba(217, 200, 184, 0.3)',
            drawBorder: false
          },
          ticks: {
            color: '#A29284',
            font: { family: 'Inter', size: 11 },
            callback: function(value) {
              return (value / 1000).toFixed(0) + 'K';
            },
            maxTicksLimit: 6
          },
          border: { display: false },
          beginAtZero: true
        }
      }
    }
  });
}
