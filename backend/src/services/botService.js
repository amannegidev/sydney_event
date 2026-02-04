import TelegramBot from "node-telegram-bot-api";
import UserPreference from "../models/UserPreference.js";
import { recommendEvents, formatRecommendations } from "./recommendationService.js";

const preferenceSteps = [
  { key: "genre", question: "What music/genre do you prefer?" },
  { key: "budget", question: "What is your budget range?" },
  { key: "dateTime", question: "Any preferred date/time?" },
  { key: "location", question: "Preferred location or suburb?" },
  { key: "crowd", question: "What crowd type do you like (calm, party, family)?" },
];

const getNextStep = (state) => preferenceSteps.find((step) => step.key === state);
const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);

export const startBot = ({ token }) => {
  if (!token) {
    return null;
  }

  const bot = new TelegramBot(token, { polling: true });

  console.log("Telegram bot started in polling mode.");
  bot.on("polling_error", (error) => {
    console.error("Telegram polling error:", error);
  });
  bot.on("webhook_error", (error) => {
    console.error("Telegram webhook error:", error);
  });

  bot.onText(/\/start/, async (msg) => {
    await bot.sendMessage(
      msg.chat.id,
      "Hi! I can recommend Sydney events. Type /prefs to set preferences."
    );
  });

  bot.onText(/\/prefs/, async (msg) => {
    const chatId = String(msg.chat.id);
    const doc = await UserPreference.findOneAndUpdate(
      { chatId },
      { state: preferenceSteps[0].key },
      { new: true, upsert: true }
    );

    await bot.sendMessage(chatId, preferenceSteps[0].question);
  });

  bot.onText(/\/recommend/, async (msg) => {
    const chatId = String(msg.chat.id);
    try {
      await bot.sendChatAction(chatId, "typing");
      const doc = await UserPreference.findOne({ chatId });
      if (!doc) {
        await bot.sendMessage(chatId, "Please set preferences first using /prefs.");
        return;
      }

      console.log("/recommend: fetching recommendations", { chatId });
      const recommendations = await withTimeout(
        recommendEvents({
          preferences: doc.preferences,
        }),
        30000,
        "recommendEvents"
      );
      if (!recommendations.length) {
        await bot.sendMessage(
          chatId,
          "No matches yet. Try updating your preferences."
        );
        return;
      }

      console.log("/recommend: formatting response", { chatId });
      const response = await withTimeout(
        formatRecommendations({
          preferences: doc.preferences,
          recommendations,
        }),
        30000,
        "formatRecommendations"
      );
      await bot.sendMessage(chatId, response);
    } catch (error) {
      console.error("/recommend failed", error);
      await bot.sendMessage(
        chatId,
        "Sorry, I hit an error while generating recommendations. Try again in a moment."
      );
    }
  });

  bot.on("message", async (msg) => {
    if (msg.text?.startsWith("/")) {
      console.log("Telegram command received:", msg.text);
    }
    if (!msg.text || msg.text.startsWith("/")) {
      return;
    }

    const chatId = String(msg.chat.id);
    const doc = await UserPreference.findOne({ chatId });
    if (!doc || doc.state === "idle") {
      return;
    }

    const step = getNextStep(doc.state);
    if (!step) {
      return;
    }

    doc.preferences[step.key] = msg.text;
    const currentIndex = preferenceSteps.findIndex((s) => s.key === step.key);
    const nextStep = preferenceSteps[currentIndex + 1];

    doc.state = nextStep ? nextStep.key : "idle";
    await doc.save();

    if (nextStep) {
      await bot.sendMessage(chatId, nextStep.question);
    } else {
      await bot.sendMessage(
        chatId,
        "Preferences saved. Use /recommend to get event suggestions."
      );
    }
  });

  return bot;
};

export const notifyUsers = async ({ events, bot }) => {
  if (!bot || !events?.length) {
    return;
  }

  const users = await UserPreference.find({});
  await Promise.all(
    users.map(async (user) => {
      const recommendations = await recommendEvents({
        preferences: user.preferences,
        limit: 2,
        events,
      });
      if (!recommendations.length) {
        return;
      }

      const response = await formatRecommendations({
        preferences: user.preferences,
        recommendations,
      });
      await bot.sendMessage(user.chatId, `New matches found:\n${response}`);
      user.lastNotifiedAt = new Date();
      await user.save();
    })
  );
};
