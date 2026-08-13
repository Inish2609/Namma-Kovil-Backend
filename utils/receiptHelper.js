exports.prepareReceiptData = (data) => {
  const date = new Date(data.created_at);

  /*
  =====================================================
  DETERMINE NAME
  =====================================================
  */

  let schemeName = "-";

  switch (String(data.type).toUpperCase()) {
    case "DONATION_SCHEME":
      schemeName = data.donation_name || "-";
      break;

    case "FESTIVAL":
      schemeName = data.festival_name || "-";
      break;

    case "EVENT":
      schemeName = data.event_name || "-";
      break;

    case "POOJA":
      schemeName = data.event_name || "-";
      break;

    default:
      schemeName = data.type || "-";
      break;
  }

  /*
  =====================================================
  AMOUNTS
  =====================================================
  */

  const assignedAmount = Number(data.assigned_amount || 0);

  const paidAmount = Number(data.total_paid_amount || 0);

  const pendingAmount = Math.max(assignedAmount - paidAmount, 0);

  /*
  =====================================================
  RETURN RECEIPT DATA
  =====================================================
  */

  return {
    receiptNo: data.receipt_number,

    date: date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),

    time: date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),

    donor: {
      name: data.donor_name || "-",

      mobile: data.donor_mobile || "-",

      address: data.donor_address || "-",
    },

    donation: {
      scheme: schemeName,

      assigned: `₹${assignedAmount.toFixed(2)}`,

      paid: `₹${paidAmount.toFixed(2)}`,

      pending: `₹${pendingAmount.toFixed(2)}`,
    },

    payment: {
      mode: data.mode || "-",

      transactionId: data.transaction_id || "-",

      referenceNo: data.reference_number || "-",
    },

    receivedBy: {
      name: data.received_by_name || "-",
    },

    verifyUrl: `https://nammakovil.com/verify/${data.receipt_number}`,
  };
};
