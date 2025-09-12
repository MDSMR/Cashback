// build: 2025-09-12 v4
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('invoiceForm');
  const submitBtn = document.querySelector('.save-print-btn');

  const rateText = document.getElementById('rateText');

  const dateEl = document.getElementById('date');
  const visitsEl = document.getElementById('visits');
  const amountEl = document.getElementById('invoiceAmount');
  const discountEl = document.getElementById('discountAmount');

  const dateError = document.getElementById('dateError');
  const visitsError = document.getElementById('visitsError');
  const amountError = document.getElementById('amountError');

  // Cashback rates (only two)
  const discountRates = {
    "الزيارة الأولى": 0.20,
    "عميل دائم": 0.25
  };

  function generateUniqueId() {
    const id = Math.floor(10000 + Math.random() * 90000);
    document.getElementById('uniqueIdDisplay').textContent = id;
    document.getElementById('uniqueIdHidden').value = id;
  }

  function setDefaultDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateEl.value = `${yyyy}-${mm}-${dd}`;
  }

  function ratePercentFor(visitType){
    const r = discountRates[visitType] || 0;
    return Math.round(r * 100) + '%';
  }

  function updateDiscount() {
    const visitType = visitsEl.value;
    const amount = parseFloat(amountEl.value) || 0;
    const rate = discountRates[visitType] || 0;
    const discount = amount * rate;

    discountEl.value = discount ?
