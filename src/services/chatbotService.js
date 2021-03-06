import { response } from "express";
import request from "request";
const breakfastList = require("./breakfast.json");
const lunchList = require("./lunch.json");
const dinnertList = require("./dinner.json");
const drinkList = require("./drink.json");

require("dotenv").config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const IMAGE_BREAKFAST =
  "https://htmlcolorcodes.com/assets/images/colors/neon-orange-color-solid-background-1920x1080.png";
const IMAGE_LUNCH =
  "https://htmlcolorcodes.com/assets/images/colors/aqua-color-solid-background-1920x1080.png";
const IMAGE_DINNER =
  "https://htmlcolorcodes.com/assets/images/colors/emerald-green-color-solid-background-1920x1080.png";
const IMG_WELCOME =
  "https://i.pinimg.com/originals/70/1c/4f/701c4f418e5d1bb0b278aea50296c568.gif";

// random BREAKFAST FOOD
let len1 = breakfastList.length;

// random LUNCH FOOD
let len2 = lunchList.length;

// random DINNER FOOD
let len3 = dinnertList.length;

// random DRINK FOOD
let len4 = drinkList.length;

let callSendAPI = async (sender_psid, response) => {
  return new Promise(async (resovle, reject) => {
    // Construct the message body
    try {
      let request_body = {
        recipient: {
          id: sender_psid,
        },
        message: response,
      };

      await sendMarkSeen(sender_psid);
      await sendTypingOn(sender_psid);

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
            resovle("message sent!");
          } else {
            console.error("Unable to send message:" + err);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

let sendTypingOn = (sender_psid) => {
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    sender_action: "typing_on",
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
        console.log("sendTypingOn sent!");
      } else {
        console.error("Unable to send sendTypingOn:" + err);
      }
    }
  );
};

let sendMarkSeen = (sender_psid) => {
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    sender_action: "mark_seen",
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
        console.log("sendMarkSeen sent!");
      } else {
        console.error("Unable to send sendMarkSeen:" + err);
      }
    }
  );
};

let getUsername = (sender_psid) => {
  // Send the HTTP request to the Messenger Platform
  return new Promise(async (resovle, reject) => {
    request(
      {
        uri: `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
        method: "GET",
      },
      (err, res, body) => {
        if (!err) {
          body = JSON.parse(body);
          // "first_name": "Peter",
          // "last_name": "Chang",
          let username = `${body.last_name} ${body.first_name}`;
          resovle(username);
        } else {
          console.error("Unable to send message:" + err);
          reject(err);
        }
      }
    );
  });
};

let handleGetStarted = (sender_psid) => {
  return new Promise(async (resovle, reject) => {
    try {
      let username = await getUsername(sender_psid);
      let response1 = {
        text: `Chào mừng bạn ${username} đến với THỰC ĐƠN VUI VẺ của NHÀ DỪA. Mình là Coco rất vui vì bạn đã ghé thăm.`,
      };

      // UI 1
      //   let response2 = getStartedTemplate();

      // UI 2
      let response2 = getImageGetStarted();
      let response3 = getQuickReply();
      // call sendAPI
      await callSendAPI(sender_psid, response1);
      await callSendAPI(sender_psid, response2);
      await callSendAPI(sender_psid, response3);
      resovle("done");
    } catch (e) {
      reject(e);
    }
  });
};

// let getStartedTemplate = () => {
//   let response = {
//     attachment: {
//       type: "template",
//       payload: {
//         template_type: "generic",
//         elements: [
//           {
//             title: "BỮA SÁNG",
//             subtitle:
//               "Nếu bấm nút, bạn sẽ nhận được công thức một món ăn ngẫu nhiên từ hệ thống",
//             image_url: IMAGE_BREAKFAST,
//             buttons: [
//               {
//                 type: "postback",
//                 title: "CHỌN NGẪU NHIÊN!",
//                 payload: "breakfast",
//               },
//             ],
//           },
//           {
//             title: "BỮA TRƯA",
//             subtitle:
//               "Nếu bấm nút, bạn sẽ nhận được công thức một món ăn ngẫu nhiên từ hệ thống",
//             image_url: IMAGE_LUNCH,
//             buttons: [
//               {
//                 type: "postback",
//                 title: "CHỌN NGẪU NHIÊN!",
//                 payload: "lunch",
//               },
//             ],
//           },
//           {
//             title: "BỮA TỐI",
//             subtitle:
//               "Nếu bấm nút, bạn sẽ nhận được công thức một món ăn ngẫu nhiên từ hệ thống",
//             image_url: IMAGE_DINNER,
//             buttons: [
//               {
//                 type: "postback",
//                 title: "CHỌN NGẪU NHIÊN!",
//                 payload: "dinner",
//               },
//             ],
//           },
//         ],
//       },
//     },
//   };
//   return response;
// };

let getImageGetStarted = () => {
  let response = {
    attachment: {
      type: "image",
      payload: {
        url: IMG_WELCOME,
      },
    },
  };
  return response;
};

let handleQuickRely = (sender_psid) => {
  return new Promise(async (resovle, reject) => {
    try {
      let response1 = getQuickReply();
      // call sendAPI
      await callSendAPI(sender_psid, response1);
      resovle("done");
    } catch (e) {
      reject(e);
    }
  });
};

let getQuickReply = () => {
  let response = {
    text: "Chọn bữa ăn bạn muốn theo dõi",
    quick_replies: [
      {
        content_type: "text",
        title: "ĂN GÌ",
        payload: "breakfast",
        image_url: IMAGE_BREAKFAST,
      },
      // {
      //   content_type: "text",
      //   title: "BỮA TRƯA",
      //   payload: "lunch",
      //   image_url: IMAGE_LUNCH,
      // },
      // {
      //   content_type: "text",
      //   title: "BỮA TỐI",
      //   payload: "dinner",
      //   image_url: IMAGE_DINNER,
      // },
      {
        content_type: "text",
        title: "UỐNG GÌ",
        payload: "drink",
        image_url: IMAGE_DINNER,
      },
    ],
  };
  return response;
};

let handleSendDrink = (sender_psid) => {
  return new Promise(async (resovle, reject) => {
    try {
      let response1 = getDrink();
      // call sendAPI
      await callSendAPI(sender_psid, response1);
      resovle("done");
    } catch (e) {
      reject(e);
    }
  });
};

let getDrink = () => {
  let randomNum4 = Math.floor(Math.random() * (len4 - 1));
  let randomDrink = drinkList[randomNum4];

  let response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "media",
        elements: [
          {
            media_type: "video",
            url: randomDrink.video,
            buttons: [
              {
                type: "web_url",
                url: randomDrink.web_url,
                title: randomDrink.name,
              },
              {
                type: "postback",
                title: "Chọn đồ uống khác",
                payload: "drink",
              },
              {
                type: "postback",
                title: "Quay lại ban đầu",
                payload: "back_to_top",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
};

let handleSendBreakfast = (sender_psid) => {
  return new Promise(async (resovle, reject) => {
    try {
      let response1 = getBreakfast();
      // call sendAPI
      await callSendAPI(sender_psid, response1);
      resovle("done");
    } catch (e) {
      reject(e);
    }
  });
};

let getBreakfast = () => {
  let randomNum1 = Math.floor(Math.random() * (len1 - 1));
  let randomBreakfast = breakfastList[randomNum1];

  let response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "media",
        elements: [
          {
            media_type: "video",
            url: randomBreakfast.video,
            buttons: [
              {
                type: "web_url",
                url: randomBreakfast.web_url,
                title: randomBreakfast.name,
              },
              {
                type: "postback",
                title: "Chọn thực đơn khác",
                payload: "breakfast",
              },
              {
                type: "postback",
                title: "Quay lại ban đầu",
                payload: "back_to_top",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
};

let handleSendLucnch = (sender_psid) => {
  return new Promise(async (resovle, reject) => {
    try {
      let response1 = getLunch();
      // call sendAPI
      await callSendAPI(sender_psid, response1);
      resovle("done");
    } catch (e) {
      reject(e);
    }
  });
};

let getLunch = () => {
  let randomNum2 = Math.floor(Math.random() * (len2 - 1));
  let randomLunch = lunchList[randomNum2];

  let response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "media",
        elements: [
          {
            media_type: "video",
            url: randomLunch.video,
            buttons: [
              {
                type: "web_url",
                url: randomLunch.web_url,
                title: randomLunch.name,
              },
              {
                type: "postback",
                title: "Chọn thực đơn khác",
                payload: "lunch",
              },
              {
                type: "postback",
                title: "Chọn lại bữa ăn",
                payload: "back_to_top",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
};

let handleSendDinner = (sender_psid) => {
  return new Promise(async (resovle, reject) => {
    try {
      let response1 = getDinner();
      // call sendAPI
      await callSendAPI(sender_psid, response1);
      resovle("done");
    } catch (e) {
      reject(e);
    }
  });
};

let getDinner = () => {
  let randomNum3 = Math.floor(Math.random() * (len3 - 1));
  let randomDinner = dinnertList[randomNum3];

  let response = {
    attachment: {
      type: "template",
      payload: {
        template_type: "media",
        elements: [
          {
            media_type: "video",
            url: randomDinner.video,
            buttons: [
              {
                type: "web_url",
                url: randomDinner.web_url,
                title: randomDinner.name,
              },
              {
                type: "postback",
                title: "Chọn thực đơn khác",
                payload: "dinner",
              },
              {
                type: "postback",
                title: "Chọn lại bữa ăn",
                payload: "back_to_top",
              },
            ],
          },
        ],
      },
    },
  };
  return response;
};

module.exports = {
  handleGetStarted: handleGetStarted,
  handleSendBreakfast: handleSendBreakfast,
  handleSendLucnch: handleSendLucnch,
  handleSendDinner: handleSendDinner,
  handleQuickRely: handleQuickRely,
  handleSendDrink: handleSendDrink,
};
