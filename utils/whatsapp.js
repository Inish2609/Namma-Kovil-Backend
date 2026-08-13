const axios = require("axios");
const FormData = require("form-data");

const ACCESS_TOKEN =
  "EAAgpgT0vkwQBSK3LLxuYXTW7jr2jebccqIijxzRz5Pm4fYcvQtKiZAKmDZAA0pG1e7IZAT096aif7krf0zWjvxy11zOqbk1xJccwMLX5ndl4zQSQyVd8UGhKMYQgsaiW7GstmX2USAPdxAo4SIQRoQzx0GbZCnZBIwKTT7XV1kFJHyL68Y5n1xH0kMYPncxHPIZB2LDBoZC9AKQOf2ZCFFsdyboQioUGioyPUsbBdXfAAyHtcyPEIpVghPWrvnGlihbwHNpjmwjP1p1t47Y8To3DZCWjitRyqK2brmQZDZD";
const PHONE_NUMBER_ID = "1191281720735506";

async function sendWhatsappPDF(phone, pdfBuffer, name, amount, scheme) {
  try {
    const form = new FormData();

    form.append("messaging_product", "whatsapp");

    form.append("file", pdfBuffer, {
      filename: "receipt.pdf",
      contentType: "application/pdf",
    });

    const upload = await axios.post(
      `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/media`,

      form,

      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          ...form.getHeaders(),
        },
      },
    );

    console.log("Media Upload Response:", upload.data);

    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",

        to: phone,

        type: "template",

        template: {
          name: "namma_kovil_receipt",

          language: {
            code: "en",
          },

          components: [
            {
              type: "header",

              parameters: [
                {
                  type: "document",

                  document: {
                    id: upload.data.id,
                    filename: "donation_receipt.pdf",
                  },
                },
              ],
            },

            {
              type: "body",

              parameters: [
                {
                  type: "text",
                  text: name ?? "",
                },

                {
                  type: "text",
                  text: scheme ?? "",
                },

                {
                  type: "text",
                  text: amount ?? 0,
                },

                {
                  type: "text",
                  text: "Scheme",
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(response.data);

  } catch (error) {
    console.log("WhatsApp Error:");

    console.log(error.response?.data || error.message);

    throw error;
  }
}

async function sendPaymentReceipt(paymentData) {
  const pdfBuffer = await generateReceipt(paymentData);

  await sendWhatsappPDF(paymentData.mobile, pdfBuffer);
}

module.exports = {
  sendWhatsappPDF,
  sendPaymentReceipt,
};
