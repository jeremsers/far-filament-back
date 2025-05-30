"use strict";

/**
 * blog controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const sendToWebhook = async (data, type) => {
  try {
    const webhookUrl = process.env.ASTRO_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("ASTRO_WEBHOOK_URL environment variable is not set");
      return;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        content: data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed with status ${response.status}`);
    }

    console.log(`Successfully sent ${type} to Astro webhook`);
  } catch (error) {
    console.error("Error sending to webhook:", error);
  }
};

module.exports = createCoreController("api::blog.blog", ({ strapi }) => ({
  async afterCreate(event) {
    const { result } = event;

    // Get the full populated entity
    const entity = await strapi.entityService.findOne(
      "api::blog.blog",
      result.id,
      {
        populate: {
          image: true,
          category: {
            fields: ["name"],
          },
          Tags: true,
        },
      },
    );

    // Send to Astro webhook
    await sendToWebhook(entity, "blog");
  },

  async afterUpdate(event) {
    const { result } = event;

    // Get the full populated entity
    const entity = await strapi.entityService.findOne(
      "api::blog.blog",
      result.id,
      {
        populate: {
          image: true,
          category: {
            fields: ["name"],
          },
          Tags: true,
        },
      },
    );

    // Send to Astro webhook
    await sendToWebhook(entity, "blog");
  },
}));
