/* ============================================
   KOALA — Finanzas Page
   Simple financial overview with a sales chart
   ============================================ */

import { icon } from '../utils/icons.js';
import { formatCurrency } from '../utils/formatters.js';
import { localDb } from '../utils/localDb.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

let finanzasChart = null;

export function renderFinanzasPage() {
  return `
    <div class="module-page">
      <!-- Header -->
      <div class="module-header">
        <div>
          <h1 class="module-header__title">Finanzas</h1>
          <p class="module-header__subtitle">Resumen simple de tus ingresos y ventas</p>
        </div>
        
        <div class="module-toolbar">
          <select id="finanzas-period-select" class="auth-input" style="min-width: 150px;">
            <option value="diario">Ventas Diarias</option>
            <option value="semanal">Ventas Semanales</option>
            <option value="mensual" selected>Ventas Mensuales</option>
            <option value="anual">Ventas Anuales</option>
          </select>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 32px;">
        <div class="kpi-card hover-lift">
          <div class="kpi-card__icon kpi-card__icon--primary">
            ${icon('dollar-sign', 24)}
          </div>
          <div class="kpi-card__content">
            <div class="kpi-card__label">Ingresos Totales (Mes)</div>
            <div class="kpi-card__value" id="finanzas-total-mes">$0.00</div>
          </div>
        </div>
        
        <div class="kpi-card hover-lift">
          <div class="kpi-card__icon kpi-card__icon--success">
            ${icon('trending-up', 24)}
          </div>
          <div class="kpi-card__content">
            <div class="kpi-card__label">Ventas Exitosas (Mes)</div>
            <div class="kpi-card__value" id="finanzas-count-mes">0</div>
          </div>
        </div>
        
        <div class="kpi-card hover-lift">
          <div class="kpi-card__icon kpi-card__icon--accent">
            ${icon('credit-card', 24)}
          </div>
          <div class="kpi-card__content">
            <div class="kpi-card__label">Ticket Promedio</div>
            <div class="kpi-card__value" id="finanzas-avg-mes">$0.00</div>
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="card animate-fade-in-up">
        <div class="card__header">
          <h2 class="card__title" id="finanzas-chart-title">Rendimiento de Ventas</h2>
        </div>
        <div class="chart-container" style="height: 400px; padding: 20px;">
          <canvas id="finanzasChart"></canvas>
        </div>
      </div>
    </div>
  `;
}

export async function initFinanzasPage() {
  try {
    const orders = await localDb.getAllOrders();
    // Only calculate using successful/completed orders realistically
    // but for demo we can just count all that aren't cancelled
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    
    // Quick calculations for "This Month" (Mocked based on recent orders)
    const totalMes = validOrders.reduce((sum, o) => sum + o.total, 0);
    const countMes = validOrders.length;
    const avgMes = countMes > 0 ? totalMes / countMes : 0;
    
    document.getElementById('finanzas-total-mes').textContent = formatCurrency(totalMes);
    document.getElementById('finanzas-count-mes').textContent = countMes;
    document.getElementById('finanzas-avg-mes').textContent = formatCurrency(avgMes);

    // Mock Data for the charts based on selection
    const chartData = {
      diario: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        data: [50, 120, 80, 200, 250, 400, 150],
        title: 'Ventas Diarias (Esta Semana)'
      },
      semanal: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        data: [350, 450, 300, 600],
        title: 'Ventas Semanales (Este Mes)'
      },
      mensual: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        data: [150, 200, 100, 350, 450, 300],
        title: 'Ventas Mensuales (Últimos 6 meses)'
      },
      anual: {
        labels: ['2023', '2024', '2025', '2026'],
        data: [250, 400, 600, 850],
        title: 'Ventas Anuales (Histórico)'
      }
    };

    const ctx = document.getElementById('finanzasChart');
    const titleEl = document.getElementById('finanzas-chart-title');
    const selectEl = document.getElementById('finanzas-period-select');

    function renderChart(period) {
      if (finanzasChart) finanzasChart.destroy();
      
      const { labels, data, title } = chartData[period];
      titleEl.textContent = title;

      // Gradient for bars
      const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, '#2B221C');
      gradient.addColorStop(1, '#8B7355');

      finanzasChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Ventas Totales',
            data: data,
            backgroundColor: gradient,
            borderRadius: 6,
            barThickness: 'flex',
            maxBarThickness: 50
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#2A211B',
              titleFont: { family: 'Inter', size: 13, weight: '600' },
              bodyFont: { family: 'Inter', size: 14, weight: '700' },
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function(context) {
                  return formatCurrency(context.parsed.y);
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Inter' } },
              border: { display: false }
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.05)' },
              border: { display: false },
              ticks: {
                font: { family: 'Inter' },
                stepSize: 50,
                callback: function(value) {
                  return '$' + value;
                }
              }
            }
          }
        }
      });
    }

    // Initial render
    renderChart('mensual');

    // Handle select changes
    selectEl.addEventListener('change', (e) => {
      renderChart(e.target.value);
    });

  } catch (error) {
    console.error('Error loading finanzas:', error);
  }
}
