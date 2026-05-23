/* ============================================
   KOALA — Order Logic
   Core logic for business rules
   ============================================ */

/**
 * Calculates due date based on Koala Rules:
 * - 1st to 14th of the month -> Due on the 15th of the next month.
 * - 15th to end of the month -> Due on the last day of the next month.
 */
export function calculateDueDate(orderDateString) {
  const date = new Date(orderDateString);
  const day = date.getDate();
  let nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  
  if (day <= 14) {
    // Due on the 15th of next month
    nextMonth.setDate(15);
  } else {
    // Due on the last day of next month
    nextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0);
  }
  
  return nextMonth.toISOString();
}

/**
 * Calculates the required minimum initial deposit (default 50%).
 */
export function calculateInitialDeposit(total, percentage = 50) {
  return (total * (percentage / 100));
}

/**
 * Calculates late fee based on +3 days grace period, +$5 daily.
 */
export function calculateLateFee(dueDateString) {
  const dueDate = new Date(dueDateString);
  const today = new Date();
  
  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // 3 days grace period
  if (diffDays <= 3) {
    return { lateDays: 0, fee: 0 };
  }
  
  const chargeableDays = diffDays - 3;
  return {
    lateDays: chargeableDays,
    fee: chargeableDays * 5
  };
}

/**
 * Calculates pending balance and updates state.
 */
export function updateOrderFinancials(order) {
  const total = order.total || 0;
  
  // Sum all valid payments
  const totalPaid = (order.payments || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  let pendingBalance = total - totalPaid;
  
  let lateFeeObj = { lateDays: 0, fee: 0 };
  
  // Apply late fee if still pending and past due date
  if (pendingBalance > 0 && order.dueDate) {
    lateFeeObj = calculateLateFee(order.dueDate);
    pendingBalance += lateFeeObj.fee;
  }
  
  // Snap small decimals
  if (pendingBalance < 0.01 && pendingBalance > -0.01) pendingBalance = 0;
  
  return {
    ...order,
    totalPaid,
    pendingBalance,
    lateFee: lateFeeObj.fee,
    lateDays: lateFeeObj.lateDays
  };
}

/**
 * Generates WhatsApp Summary Text
 */
export function generateWhatsAppSummary(order) {
  const isPaid = order.pendingBalance <= 0;
  
  const dateObj = new Date(order.dueDate);
  const formattedDate = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  
  let text = `Hola ${order.customer} 👋\n\nTu orden ${order.id} está confirmada.\n\n`;
  text += `Total: $${order.total.toFixed(2)}\n`;
  text += `Pagado: $${(order.totalPaid || 0).toFixed(2)}\n`;
  
  if (isPaid) {
    text += `Balance: PAGADO ✅\n\n`;
  } else {
    text += `Balance pendiente: $${order.pendingBalance.toFixed(2)}\n`;
    text += `Fecha límite: ${formattedDate}\n\n`;
  }
  
  text += `Gracias por comprar en KOALA by JC.`;
  return text;
}
