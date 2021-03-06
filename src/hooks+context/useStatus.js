import { useEffect } from "react";
import firebase from "firebase";
import { useStateValue } from "./StateProvider";

export default function useStatus() {
	const [{ user, last_bar, last_table }] = useStateValue();
	// Fetch the current user's ID from Firebase Authentication.
	const uid = firebase.auth().currentUser?.uid;

	useEffect(() => {
		firebase
			.database()
			.ref("users/" + uid)
			.update({
				last_bar: last_bar,
				last_table: last_table,
			});
	}, [last_table]);

	useEffect(() => {
		if (user != null) {
			// ----------------------------------------------------------
			// Code to connect to Realtime database

			// Create a reference to this user's specific status node.
			// This is where we will store data about being online/offline.
			const userStatusDatabaseRef = firebase.database().ref("/users/" + uid);

			// Create two constants which we will write to the Realtime database when this device is offline or online.
			const isOfflineForDatabase = {
				state: "offline",
				last_changed: firebase.database.ServerValue.TIMESTAMP,
			};

			const isOnlineForDatabase = {
				state: "online",
				last_changed: firebase.database.ServerValue.TIMESTAMP,
			};

			// Create a reference to the special '.info/connected' path in Realtime Database.
			// Returns `true` when connected and `false` when disconnected.
			firebase
				.database()
				.ref(".info/connected")
				.on("value", function (snapshot) {
					if (snapshot.val() == false) {
						return;
					}

					// Use 'onDisconnect()'
					// Triggers when client has disconnected by closing the app, losing internet, etc.
					userStatusDatabaseRef
						.onDisconnect()
						.update(isOfflineForDatabase)
						.then(function () {
							userStatusDatabaseRef.update(isOnlineForDatabase);
						});
				});

			// ------------------------------------------------------------------------
			// Update Cloud firestore's local cache...

			const userStatusFirestoreRef = firebase.firestore().doc("/users/" + uid);

			// Firestore uses a different server timestamp value
			// Instead create two more constants for Firestore state.
			const isOfflineForFirestore = {
				state: "offline",
				last_changed: firebase.firestore.FieldValue.serverTimestamp(),
			};

			const isOnlineForFirestore = {
				state: "online",
				last_changed: firebase.firestore.FieldValue.serverTimestamp(),
			};

			firebase
				.database()
				.ref(".info/connected")
				.on("value", function (snapshot) {
					if (snapshot.val() == false) {
						// Set Firestore's state to 'offline'. This ensures that our Firestore cache is awarevof the switch to 'offline.'
						userStatusFirestoreRef.update(isOfflineForFirestore);
						return;
					}

					userStatusDatabaseRef
						.onDisconnect()
						.update(isOfflineForDatabase)
						.then(function () {
							userStatusDatabaseRef.update(isOnlineForDatabase);

							// We'll also add Firestore set here for when we come online.
							userStatusFirestoreRef.update(isOnlineForFirestore);
						});
				});

			// -------------------------------------------------------------------

			// ****** CANNOT USE CODE BELOW WHEN STORING DATA IS USER COLLECTION INSTEAD OF STATUS
			// Check and console what what the client thinks the online status is
			// userStatusFirestoreRef.onSnapshot(function(doc) {
			// 	const isOnline = doc.data().state == 'online';
			// 	console.log("Is online function says: ", isOnline)
			// });
		}
	}, [user]); // END OF USE EFFECT HOOK - UPDATES WHEN USER CHANGES (login/logout/disconnect)
}
