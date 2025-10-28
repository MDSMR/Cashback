document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('invoiceForm');
  const submitBtn = document.querySelector('.save-print-btn');
  const arabicDateDiv = document.getElementById('arabicDateDisplay');
  
  // Generate unique ID
  function generateUniqueId() {
    const id = Math.floor(10000 + Math.random() * 90000);
    const displayElement = document.getElementById('uniqueIdDisplay');
    const hiddenElement = document.getElementById('uniqueIdHidden');
    
    if (displayElement) displayElement.textContent = id;
    if (hiddenElement) hiddenElement.value = id;
  }
  
  // Set today's date
  function setDefaultDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateField = document.getElementById('date');
    if (dateField) dateField.value = `${yyyy}-${mm}-${dd}`;
  }
  
  // Format date in Arabic
  function formatArabicDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ar-EG', options);
  }
  
  // Discount rates
  const discountRates = {
    "الزيارة الأولى": 0.10,
    "الزيارة الثانية": 0.15,
    "الزيارة الثالثة": 0.20,
    "عميل دائم": 0.20
  };
  
  // Calculate and update discount
  function updateDiscount() {
    const visitType = document.getElementById('visits').value;
    const invoiceAmount = parseFloat(document.getElementById('invoiceAmount').value) || 0;
    const rate = discountRates[visitType] || 0;
    const discount = (invoiceAmount * rate).toFixed(2);
    
    const discountField = document.getElementById('discountAmount');
    if (discountField) discountField.value = discount;
    
    // Update the rate hint if it exists
    const rateText = document.getElementById('rateText');
    if (rateText) {
      rateText.textContent = (rate * 100) + '%';
    }
  }
  
  // Initialize
  generateUniqueId();
  setDefaultDate();
  
  // Add event listeners
  const visitsField = document.getElementById('visits');
  const amountField = document.getElementById('invoiceAmount');
  
  if (visitsField) visitsField.addEventListener('change', updateDiscount);
  if (amountField) amountField.addEventListener('input', updateDiscount);
  
  // Form submission - FAST VERSION
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      // Get form values
      const dateField = document.getElementById('date');
      const amount = document.getElementById('invoiceAmount');
      const visitType = document.getElementById('visits');
      
      // Quick validation
      if (!dateField || !dateField.value) {
        alert("يرجى إدخال التاريخ");
        return;
      }
      
      if (!visitType || !visitType.value) {
        alert("يرجى اختيار نوع الزيارة");
        return;
      }
      
      if (!amount || !amount.value || parseFloat(amount.value) <= 0) {
        alert("يرجى إدخال قيمة الفاتورة أكبر من صفر");
        return;
      }
      
      // PRINT IMMEDIATELY - Don't wait for email
      if (arabicDateDiv) {
        arabicDateDiv.textContent = formatArabicDate(dateField.value);
      }
      
      // Update print summary if exists
      updatePrintSummary();
      
      // Print NOW
      window.print();
      
      // Send email in background (don't wait for it)
      if (navigator.onLine) {
        const formData = new FormData(form);
        
        // Send to FormSubmit but don't wait
        fetch("https://formsubmit.co/ajax/mellow-churros", {
          method: "POST",
          body: formData,
          headers: { 'Accept': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
          console.log('Email sent successfully:', data);
        })
        .catch(error => {
          console.log('Email sending failed, but voucher was printed:', error);
        });
      }
      
      // Reset form immediately after print dialog
      setTimeout(() => {
        resetForm();
      }, 100);
    });
  }
  
  // Reset form function
  function resetForm() {
    if (form) form.reset();
    setDefaultDate();
    generateUniqueId();
    
    const discountField = document.getElementById('discountAmount');
    if (discountField) discountField.value = "";
    
    if (arabicDateDiv) arabicDateDiv.textContent = "";
  }
  
  // Update print summary
  function updatePrintSummary() {
    const amount = document.getElementById('invoiceAmount');
    const discount = document.getElementById('discountAmount');
    const visitType = document.getElementById('visits');
    
    if (amount && discount) {
      const amountValue = parseFloat(amount.value) || 0;
      const discountValue = parseFloat(discount.value) || 0;
      const rate = discountRates[visitType?.value] || 0;
      const net = amountValue - discountValue;
      
      const amountText = document.getElementById('amountText');
      const rateOnlyText = document.getElementById('rateOnlyText');
      const discountText = document.getElementById('discountText');
      const netText = document.getElementById('netText');
      
      if (amountText) amountText.textContent = amountValue.toFixed(2) + ' جنيه';
      if (rateOnlyText) rateOnlyText.textContent = (rate * 100) + '%';
      if (discountText) discountText.textContent = discountValue.toFixed(2) + ' جنيه';
      if (netText) netText.textContent = net.toFixed(2) + ' جنيه';
    }
  }
  
  console.log('Voucher system - Fast version loaded');
});
