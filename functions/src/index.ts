import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
//import * as nodemailer from "nodemailer";
//import * as postmarkTransport from "nodemailer-postmark-transport";
//const nodemailer = require("nodemailer");

admin.initializeApp();
import {Database} from "./Database";

const region = "europe-west1";
const functionsPrefix = functions.region(region);
const db = new Database();

exports.onUserCreate = functionsPrefix.auth.user()
    .onCreate(user => {
        let newUser = {
            "name": user.displayName,
            "email": user.email,
            "verified": user.emailVerified,
            "avatar": user.photoURL,
            "disabled": user.disabled,
            "uid": user.uid
        };
        db.addToDb("Users", user.uid, newUser);
    });

exports.onUserDelete = functionsPrefix.auth.user()
    .onDelete(user => {
        db.removeFromDb("Users", user.uid);
    });

exports.onUserUpdate = functionsPrefix.firestore.document("Users/{userId}")
    .onUpdate((change, context) => {

        let newVal: any = "";
        newVal = change.after.data();

        console.log(newVal);
        admin.auth().updateUser(newVal.uid, {
            "email": newVal.email,
            "displayName": newVal.name,
            "photoURL": newVal.avatar,
            "disabled": newVal.disabled,
            "emailVerified": newVal.verified
        })
            .then(function (userRecord) {
                console.log("Updated user " + userRecord);
            })
            .catch(function (error) {
                console.log('Error updating user:', error);
            });
    });

export const createUser = functionsPrefix.https.onRequest((request, response) => {
    const data = request.query;
    const email = data.email;
    const password = data.password;
    const displayName = data.displayName;

    admin.auth().createUser({
        "email": email,
        "password": password,
        "displayName": displayName
    }).then(function (userRecord) {
        console.log("Created User with E-Mail: " + userRecord.email);
    })
        .catch(function (error) {
            console.log("Error creating User: " + error);
        });
    sendMail("create", email);
    response.send("User created!");
});

function sendMail(prefix: String, email: String) {

    const templates = {
        "welcome": {
            "subject": "Wilkommen!",
            "html": "Hallo neues Mitglied! Vielen Dank, dass du dich registriert hast!"
        },
        "bye": {
            "subject": "Vielen Dank!",
            "html": "Vielen Dank für deine Treue! Alles gute!"
        },
        "deadline": {
            "subject": "Du hast noch Aufgaben!",
            "html": "Hey du! Aufwachen! Du hast noch Aufgaben zu erledigen!"
        }
    };

    const mailOptions = {
        from: '"To Do" <todo@example.com>',
        to: '${user.email}',
        subject: '${templates[prefix]["subject"]}',
        html: '${templates[prefix]["subject]}'
    };

    return mailTansport.sendMail(mailOptions)
        .then(() => console.log("Sending Mail... ${prefix}"))
        //.catch((error) => console.error("Mail Sending failed"));
}

