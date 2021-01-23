// React, hooks and state
import React, { useState, useEffect } from "react";
import { useStateValue } from "./hooks+context/StateProvider";

//Firebase
import db from "./firebase";
import firebase from "firebase";

// Style
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import "./ChatInput.css";

const useStyles = makeStyles((theme) => ({
	root: {
		"& > *": {
			margin: theme.spacing(1),
			width: "99%",
		},
	},
}));

// Primary ChatInput function
function ChatInput({ barId, tableId, tableNumber }) {
	const [{ user }] = useStateValue();
	const [input, setInput] = useState("");
	const [randomPlaceholder, setRandomPlaceholder] = useState("");
	const classes = useStyles();

	// Place random placeholder in chat field
	useEffect(() => {
		const randomChatBoxPlaceholder = [
			"Who has better arms? The Rock, or Michelle Oboma? Discuss...",
			"This one time at band camp...",
			"Would you ever sing with a banana at the dinner table?",
			"Tell your best Chuck Norris joke...",
			"What are you going to do this weekend?",
			"Is a hotdog a sandwich? Why or why not?",
			"Is cereal soup? Why or why not?",
			"What’s the best type of cheese?",
			"How many chickens would it take to kill an elephant?",
			"What’s the best inside joke you’ve been a part of?",
			"What would the world be like if it was filled with male and female copies of you?",
			"Where was the most in appropriate / most embarrassing place you’ve farted?",
			"What is the weirdest thing you have seen in someone else’s home?",
			"Convince everyone to play shot-glass checkers with you on Zoom!",
		];

		setRandomPlaceholder(
			randomChatBoxPlaceholder[
				Math.floor(Math.random() * randomChatBoxPlaceholder.length)
			]
		);
	}, []);

	// Set the className string for the chat bubble for send/recieve message and main/whisper message
	useEffect(() => {
		if (input !== "") {
			db.collection("bars")
				.doc(barId)
				.collection("tables")
				.doc(tableId)
				.collection("usersAtTable")
				.doc(user.uid)
				.update({
					isTyping: true,
				});
		} else {
			db.collection("bars")
				.doc(barId)
				.collection("tables")
				.doc(tableId)
				.collection("usersAtTable")
				.doc(user.uid)
				.update({
					isTyping: false,
				});
		}
	}, [input]);

	// Save a sent message to the database
	const sendMessage = (event) => {
		event.preventDefault();

		db.collection("bars")
			.doc(barId)
			.collection("tables")
			.doc(tableId)
			.collection("messages")
			.add({
				message: input,
				timestamp: firebase.firestore.FieldValue.serverTimestamp(),
				user: user.displayName,
				recipient: ["all"],
				userImage: user.photoURL,
			});

		db.collection("bars")
			.doc(barId)
			.collection("tables")
			.doc(tableId)
			.collection("usersAtTable")
			.doc(user.uid)
			.update({
				isTyping: false,
			});
		setInput("");
	};

	// Render the Chat Input
	return (
		<div className="chatInput">
			<form className={classes.root} noValidate autoComplete="off">
				<TextField
					id="outlined-basic"
					label={randomPlaceholder}
					variant="outlined"
					value={input}
					onChange={(event) => setInput(event.target.value)}
					placeholder={`Message Table #${tableNumber}`}
				/>
				<button type="submit" onClick={sendMessage}></button>
			</form>
		</div>
	);
}

export default ChatInput;
