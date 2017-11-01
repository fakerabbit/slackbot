'use strict';
const Botkit = require('botkit');
const google = require('google');
const apiai = require('apiai');
const uuid = require('uuid');

var app = apiai("<your client access token>");

const controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
  token: '<your slack oauth access token>',
}).startRTM();

// give the bot something to listen for.
controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {
  bot.reply(message,'Hello yourself.');
});

controller.hears(['.*'],['direct_message','direct_mention','mention'],function(bot,message) {
  const sessionId = uuid.v1();
  console.log('heard message: ', message);
  const request = app.textRequest(message.text, {
    sessionId: sessionId
  });

  request.on('response', function(response) {
    console.log('response', response);
    if (response) {
      const result = response.result;
      if (result) {
        console.log('result: ', result);
        const fulfillment = result.fulfillment;
        if (fulfillment && fulfillment.speech && fulfillment.speech.length > 0) {
          bot.reply(message, fulfillment.speech);
        }
        else {
          bot.reply(message, "No manches wey...");
        }
      }
    }
  });

  request.on('error', function(error) {
    console.log('error: ', error);
  });

  request.end();

});

controller.hears('recipe now',['direct_message','direct_mention','mention'],function(bot,message) {
  bot.startConversation(message, askIngredients);
});

controller.hears(['find recipe'],['ambient'],function(bot,message) {
  bot.startConversation(message, askIngredients);
  /*bot.startConversation(message,function(err,convo) {

      convo.ask('How are you?',function(response,convo) {

          convo.say('Cool, you said: ' + response.text);
          convo.next();
      });
    });*/
});