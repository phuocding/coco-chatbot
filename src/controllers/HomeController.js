require("dotenv").config();
import request from "request";
import chatbotService from "../services/chatbotService";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

let getHomePage = (req, res) => {
  return res.render("homepage.ejs");
};

let postWebhook = (req, res) => {
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
};

let getWebhook = (req, res) => {
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  switch (payload) {
    case "yes":
      response = {
        text: "Hình ảnh thú vị quá, cảm ơn bạn đã chia sẻ.",
      };
      await chatbotService.handleGetStarted(sender_psid);
      break;
    case "no":
      response = { text: "Oh, bạn hãy thử gửi lại hình ảnh khác nhé." };
      break;
    case "RESTART_BOT":
    case "GET_STARTED":
      await chatbotService.handleGetStarted(sender_psid);
      break;
    case "breakfast":
      await chatbotService.handleSendBreakfast(sender_psid);
      break;
    // case "lunch":
    //   await chatbotService.handleSendLucnch(sender_psid);
    //   break;
    // case "dinner":
    //   await chatbotService.handleSendDinner(sender_psid);
    //   break;
    case "drink":
      await chatbotService.handleSendDrink(sender_psid);
      break;
    case "back_to_top":
      await chatbotService.handleQuickRely(sender_psid);
      break;
    default:
      response = {
        text: `Oops, hình như tớ chưa thể đáp ứng mong muốn ${payload}`,
      };
  }

  // Send the message to acknowledge the postback
  // callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v11.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

// Handles messages events
async function handleMessage(sender_psid, received_message) {
  let response;

  if (
    received_message &&
    received_message.attachments &&
    received_message.attachments[0].payload
  ) {
    callSendAPI(sender_psid, "Cảm ơn bạn đã ghé thăm");
    callSendAPIWithTemplate(sender_psid);
    return;
  }

  // check greeting is here and is confident
  let entitiesArr = [
    "welcome",
    "saybye",
    "apologise",
    "thanks",
    "feeling",
    "people",
    "congratulation",
    "breakfast",
    "lunch",
    "dinner",
    "date",
    "drinks",
    "food",
    "question",
    "requirement",
    "sleep",
    "suggestion",
  ];
  let entityChosen = "";

  entitiesArr.forEach((name) => {
    let entity = firstTrait(received_message.nlp, name);
    if (entity && entity.confidence > 0.8) {
      entityChosen = name;
    }
  });

  if (entityChosen !== "") {
    if (entityChosen === "feeling") {
      //send greetings message
      response = {
        text: "Bạn có ổn không, hãy thử gọi sữa chua trân châu Hạ Long nhé",
      };
    }
    if (entityChosen === "food") {
      //send thanks message
      response = { text: "Bạn có thể ăn mỳ vằn thắn nhé" };
    }
    if (entityChosen === "date") {
      //send bye message
      response = { text: "Hôm nay bạn muốn ăn đồ chay không?" };
    }
  } else {
    // default
    response = {
      text: `Coco đang thông minh dần lên, bạn hãy thử lại nhé`,
    };
  }

  // Check if quick reply
  if (received_message.quick_reply && received_message.quick_reply.payload) {
    if (received_message.quick_reply.payload === "breakfast") {
      await chatbotService.handleSendBreakfast(sender_psid);
    }
    if (received_message.quick_reply.payload === "drink") {
      await chatbotService.handleSendDrink(sender_psid);
    }
    // if (received_message.quick_reply.payload === "lunch") {
    //   await chatbotService.handleSendLucnch(sender_psid);
    // }
    // if (received_message.quick_reply.payload === "dinner") {
    //   await chatbotService.handleSendDinner(sender_psid);
    // }
    return;
  }

  // Check if the message contains text
  // if (received_message.text) {
  //   console.log("---------------------");
  //   console.log(received_message.text);
  //   console.log("---------------------");
  //   // Create the payload for a basic text message
  //   response = {
  //     text: `Tớ đã nhận được thánh chỉ có nội dung "${received_message.text}".`,
  //   };
  //   await chatbotService.handleQuickRely(sender_psid);
  // } else if (received_message.attachments) {
  //   // Get the URL of the message attachment
  //   let attachment_url = received_message.attachments[0].payload.url;
  //   response = {
  //     attachment: {
  //       type: "template",
  //       payload: {
  //         template_type: "generic",
  //         elements: [
  //           {
  //             title: "Đây có phải món ăn bạn muốn giới thiệu?",
  //             subtitle: "Bấm nút để trả lời.",
  //             image_url: attachment_url,
  //             buttons: [
  //               {
  //                 type: "postback",
  //                 title: "Đúng vậy!",
  //                 payload: "yes",
  //               },
  //               {
  //                 type: "postback",
  //                 title: "Không phải!",
  //                 payload: "no",
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     },
  //   };
  // }

  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handle NLP
function firstTrait(nlp, name) {
  return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}

let callSendAPIWithTemplate = (sender_psid) => {
  // document fb message template
  // https://developers.facebook.com/docs/messenger-platform/send-messages/templates
  let body = {
    recipient: {
      id: sender_psid,
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Bạn có muốn tham khảo một vài lựa chọn dưới đây?",
              image_url:
                "https://i.pinimg.com/originals/70/1c/4f/701c4f418e5d1bb0b278aea50296c568.gif",
              subtitle:
                "Nhấn Like và Follow Page để chờ đón những thông tin mới nhất",
              buttons: [
                {
                  type: "web_url",
                  url: "https://fb.com/coco23210",
                  title: "Truy cập ngay",
                },
              ],
            },
          ],
        },
      },
    },
  };

  request(
    {
      uri: "https://graph.facebook.com/v11.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: body,
    },
    (err, res, body) => {
      if (!err) {
        // console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
};

let setupProfile = async (req, res) => {
  //call profile fb API
  let request_body = {
    get_started: { payload: "GET_STARTED" },
    whitelisted_domains: ["https://chatbot-coco23210.herokuapp.com/"],
  };

  // Send the HTTP request to the Messenger Platform
  await request(
    {
      uri: `https://graph.facebook.com/v11.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("Setup user profile succeeds!");
      } else {
        console.error("Unable to setup user profile:" + err);
      }
    }
  );

  return res.send("Setup user profile succeeds!");
};

let setupPersistentMenu = async (req, res) => {
  //call profile fb API
  let request_body = {
    persistent_menu: [
      {
        locale: "default",
        composer_input_disabled: false,
        call_to_actions: [
          {
            type: "web_url",
            title: "NHÀ DỪA",
            url: "https://www.facebook.com/coco23210",
            webview_height_ratio: "full",
          },
          {
            type: "postback",
            title: "KHỞI ĐỘNG LẠI",
            payload: "RESTART_BOT",
          },
        ],
      },
    ],
  };

  // Send the HTTP request to the Messenger Platform
  await request(
    {
      uri: `https://graph.facebook.com/v11.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      console.log(body);
      if (!err) {
        console.log("Setup Persistent Menu succeeds!");
      } else {
        console.error("Unable to Setup Persistent Menu:" + err);
      }
    }
  );

  return res.send("Setup Persistent Menu succeeds!");
};

module.exports = {
  getHomePage: getHomePage,
  getWebhook: getWebhook,
  postWebhook: postWebhook,
  setupProfile: setupProfile,
  setupPersistentMenu: setupPersistentMenu,
};
