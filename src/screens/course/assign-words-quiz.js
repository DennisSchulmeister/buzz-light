/*
 * Buzz - The Social LMS (https://www.buzzlms.de)
 * © 2017  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 */
"use strict";

import styles from "./assign-words-quiz.less";

import ko from "knockout";

import plugins from "../../app.js";
const _ = plugins["I18n"].translate;

/**
 * Custom ko-component with a picture puzzle where the learner must assign
 * the right words to the right pictures. Here's a full example:
 *
 *     <assign-words-quiz style="padding: 4rem">
 *         <quiz-title>
 *             An Animalistic Picture Puzzle
 *         </quiz-title>
 *         <quiz-description>
 *             Which animals do you see and what are they doing? Tip on each picture
 *             and assign the right two words.
 *         </quiz-description>
 *         <quiz-answers name="all-answers">
 *             <quiz-answer name="dog" amount="2">Dog</quiz-answer>
 *             <quiz-answer name="cat" amount="2">Cat</quiz-answer>
 *             <quiz-answer name="mouse">Mouse</quiz-answer>
 *             <quiz-answer name="tired">Tired</quiz-answer>
 *             <quiz-answer name="anxious">Anxious</quiz-answer>
 *             <quiz-answer name="happy">Happy</quiz-answer>
 *             <quiz-answer name="watching">Watching</quiz-answer>
 *             <quiz-answer name="waiting">Waiting</quiz-answer>
 *         </quiz-answers>
 *
 *         <quiz-feedback-positive>
 *             Very good. You guessed everything right.
 *         </quiz-feedback-positive>
 *         <quiz-feedback-negative>
 *             That's no quite right, yet. Better have a closer look.
 *         </quiz-feedback-negative>
 *
 *         <quiz-row>
 *             <quiz-card
 *                 class    = "col-4"
 *                 answers  = "all-answers"
 *                 correct  = "dog happy"
 *             >
 *                 <img src="%content-url%/interactive/img/dog1.jpg" class="img-fit-contain" />
 *                 <p>
 *                     <small>Image source: <a href="https://pixabay.com/de/hund-gl%C3%BCcklich-bulldogge-happy-dog-2365014/">Pixabay: istvangyal</a></small>
 *                 </p>
 *             </quiz-card>
 *             ...
 *         </quiz-row>
 *
 *         <quiz-row>
 *             ...
 *         </quiz-row>
 *     </assign-words-quiz>
 *
 * The main building block of the quiz are the <quiz-card>-elements which are
 * put inside <quize-row>-elements. This renders several rows with several cards
 * in them which contain the pictures to which answers must be assigned.
 *
 * The answers are defined in at least one <quiz-answers>-element which contains
 * one ore more <quiz-answer>-elements. The answers-attribute of the <quiz-card>
 * selects which set of answers are possible for a given card. Each answer must
 * have a name so that the correct answers can be set for each card as a space
 * separated list on the correct-attribute.
 *
 * The quiz may have a feedback which is shown when there are correct answers
 * missing or wrong answers assigned. class- and style-attributes are rendered
 * as given as well as any other HTML content.
 */
class AssignWordsQuiz {
    /**
     * Register ko-component for this custom HTML tag.
     * @param {Object} courseModel CourseScreenMain instance
     */
    static register(courseModel) {
        this.courseModel = courseModel;

        ko.components.register("assign-words-quiz", {
            viewModel: {
                createViewModel: (params, componentInfo) => {
                    return new AssignWordsQuiz(params, componentInfo);
                },
            },
            template: require("./assign-words-quiz.html"),
        });
    }

    /**
     * Unregister ko-component for this custom HTML tag.
     */
    static unregister() {
        ko.components.unregister("assign-words-quiz");
    }

    /**
     * Constructor method.
     *
     * @param  {Object} params Parameters given to the ko-component in HTML
     * @param  {Object} componentInfo knockout component info which also contains
     *     the HTML tags inside the <assign-words-quiz>-element
     */
    constructor(params, componentInfo) {
        // Add CSS class with custom stylesheet attributes to the container element
        componentInfo.element.classList.add(styles.quiz);

        // Parse quiz definition from inner HTML elements
        this.quiz = this.parseQuizDefinition(componentInfo.templateNodes);

        // Toggle solution
        this.solutionHidden = ko.observable(true);

        this.textToggleSolution = ko.computed(() => {
            if (this.solutionHidden()) return _("Show Solution");
            return _("Hide Solution");
        });

        this.feedbackHtml = ko.observable("");

        // Click handler to close the answer selection menu on any click
        // outside the menu
        this._closeAnswerSelection = this.closeAnswerSelection.bind(this);
        document.addEventListener("click", this._closeAnswerSelection);
    }

    /**
     * Unregister global click event handler for closing the answer selection
     * menu on any click outside of the menu.
     */
    dispose() {
        document.removeEventListener("click", this._closeAnswerSelection);
    }

    /**
     * Parse the DOM nodes inside the <assign-words-quiz>-element and return
     * an object with the parsed quiz definition. The returned object has the
     * following format:
     *
     *     {
     *         title: "An Animalistic Picture Puzzle",
     *         description: "Which animals do you see",
     *         answers: {
     *             all-answers: [
     *                 {
     *                     name: "dog",
     *                     amount: ko.observable(2),
     *                     innerHTML: "Dog",
     *                 },
     *                 {
     *                     name: "cat",
     *                     amount: ko.observable(2),
     *                     innerHTML: "Cat",
     *                 },
     *                 {
     *                     name: "mouse",
     *                     amount: ko.observable(1),
     *                     innerHTML: "Mouse",
     *                 },
     *             ],
     *         },
     *         feedbackPositive: "Very good. You guessed everything right.",
     *         feedbackNegative: "That's no quite right, yet. Better have a closer look.",
     *         rows: [
     *             [
     *                 {
     *                     class: ko.observable("col-4"),
     *                     answers: [ ... all-answers list from above ... ],
     *                     correct: ["dog", "happy"],
     *                     selectedAnswers: ko.observableArray( ... containing answer objects ... ),
     *                     answerSelectionHidden: ko.observable(false),
     *                     innerHTML: "<img ..."
     *                 },
     *                 ...
     *             ],
     *         ...
     *         ],
     *     }
     * @param  {Array} nodes DOM nodes inside the <assign-words-quiz>-element
     * @return {Object} Internal representation of the quiz as described above
     */
    parseQuizDefinition(nodes) {
        let quiz = {
            title: "",
            description: "",
            answers: {},
            feedbackPositive: "",
            feedbackNegative: "",
            rows: [],
        };

        let _parseQuizAnswers = node => {
            let answers = {
                name: node.getAttribute("name") || "",
                answers: [],
            }

            for (let i = 0; i < node.children.length; i++) {
                let answerNode = node.children[i];

                let answer = {
                    name: answerNode.getAttribute("name") || `${i}`,
                    initialAmount: parseInt(answerNode.getAttribute("amount") || 1),
                    amount: ko.observable(),
                    innerHTML: answerNode.innerHTML,
                };

                answer.amount(answer.initialAmount);
                answers.answers.push(answer);
            }

            return answers;
        }

        let _parseQuizRow = node => {
            let row = [];

            for (let i = 0; i < node.children.length; i++) {
                let cardNode = node.children[i];
                row.push(_parseQuizCard(cardNode));
            }

            return row;
        };

        let _parseQuizCard = node => {
            // At first card.answers holds the name of the allowed answer set.
            // This will later be replaced with a reference to quiz.answers[...].
            let card = {
                class: ko.observable(node.getAttribute("class") || ""),
                answers: node.getAttribute("answers") || "",
                correct: node.getAttribute("correct") || "",
                selectedAnswers: ko.observableArray(),
                answerSelectionHidden: ko.observable(false),
                innerHTML: node.innerHTML,
            };

            card.correct = card.correct.split(" ");
            return card;
        };

        nodes.forEach(node => {
            if (node.nodeType != 1) return;

            switch (node.nodeName) {
                case "QUIZ-TITLE":
                    quiz.title = node.innerHTML;
                    break;
                case "QUIZ-DESCRIPTION":
                    quiz.description = node.innerHTML;
                    break;
                case "QUIZ-ANSWERS":
                    let answers = _parseQuizAnswers(node);
                    quiz.answers[answers.name] = answers.answers;
                    break;
                case "QUIZ-FEEDBACK-POSITIVE":
                    quiz.feedbackPositive = node.innerHTML;
                    break;
                case "QUIZ-FEEDBACK-NEGATIVE":
                    quiz.feedbackNegative = node.innerHTML;
                    break;
                case "QUIZ-ROW":
                    quiz.rows.push(_parseQuizRow(node));
                    break;
                case "QUIZ-CARD":
                    if (quiz.rows.length == 0) quiz.rows.push([]);
                    quiz.rows[quiz.rows.length - 1].push(_parseQuizCard(node));
                    break;
            }
        });

        quiz.rows.forEach(row => {
            row.forEach(card => {
                if (card.answers in quiz.answers) card.answers = quiz.answers[card.answers];
                else card.answers = {};
            });
        });

        return quiz;
    }

    /**
     * Called inside the template to work around the problem that CSS can only
     * animate the height if the start and end values are explicitly set.
     * Therefor the DOM element containing the answer selection menu is initially
     * visible so we can determine its inner height and give it to CSS.
     *
     * @param {DOMElement} element The DOM element whose size needs to be set
     * @param {Object} card Definition of the quiz card, containing the
     *     answerSelectionHidden property
     */
    initAnswerSelectionAnimation(element, card) {
        card.answerSelectionElement = element.parentNode;
        this.updateAnswerSelectionAnimation(card);
        card.answerSelectionHidden(true);
        return false;
    }

    /**
     * Update the size of a card's answer selection menu, after its content
     * has changed.
     *
     * @param {Object} card Definition of the quiz card whose answer selection
     *     menu needs to be resized.
     */
    updateAnswerSelectionAnimation(card) {
        let ulElement = card.answerSelectionElement.firstElementChild;
        card.answerSelectionElement.style.height = `${ulElement.clientHeight}px`;
    }

    /**
     * Called inside the template to toggle the display of a selection of all
     * possible answers of a card.
     *
     * @param {Object} card Definition of the card where the answer is needed
     */
    toggleAnswerSelection(card) {
        if (card.answerSelectionHidden()) {
            // Show answer selection menu
            if (!this.solutionHidden()) return;

            this.closeAnswerSelection();
            this.updateAnswerSelectionAnimation(card);
            card.answerSelectionHidden(false);

            // Disable animation, when the menu is open because the animation
            // for removing menu items looks bad
            window.setTimeout(() => card.answerSelectionElement.classList.remove("animated"), 750);
        } else {
            // Hide answer selection menu
            card.answerSelectionElement.classList.add("animated");
            card.answerSelectionHidden(true);
        }
    }

    /**
     * Close any answer selection menu which might currently be visible.
     */
    closeAnswerSelection() {
        this.quiz.rows.forEach(cards => {
            cards.forEach(card => {
                if (!card.answerSelectionHidden()) this.toggleAnswerSelection(card);
            });
        });
    }

    /**
     * Called inside the template to add an answer to a card. This adds a copy
     * of the answer definition to the card's selectedAnswers and decreases
     * the available amount of the answer.
     *
     * The copied answer definition contains a few more keys:
     *
     *     name: The name of the answer
     *     innerHTML: The HTML to show for that answer
     *     addedByUser: Set to true because the answer has been explicitly
     *          added by the user. This flag is used to distinguish answers
     *          which have not been added by the user but are shown when the
     *          user wants to see the quiz's solution.
     *     class (observable): CSS style to use on that answer. Used to highlight
     *          missing and wrong answers when the solution is visible.
     *
     * Nothing is done if the answer's remaining amount is less than one or
     * if the answer key is already present on the card.
     *
     * @param {Object} card Definition of the card where the answer is needed
     * @param {Object} answer Definition of the answer which should be added
     */
    addAnswer(card, answer) {
        // Check if the answer is still allowed
        if (!this.solutionHidden()) return;
        if (answer.amount() < 1) return;
        let alreadyExists = false;

        card.selectedAnswers().forEach(alreadyExistingAnswer => {
            if (alreadyExistingAnswer.name === answer.name) alreadyExists = true;
        })

        if (alreadyExists) return;

        // Goon and add the answer
        card.selectedAnswers.push({
            name: answer.name,
            innerHTML: answer.innerHTML,
            addedByUser: true,
            class: ko.observable(""),
        });

        answer.amount(answer.amount() - 1);

        // Adjust the menu height
        this.updateAnswerSelectionAnimation(card);
    }

    /**
     * Called inside the template to remove a given answer from a card. This
     * removes the answer from the card's selectedAnswers and increases the
     * available amount of the answer again.
     *
     * @param {Object} card Definition of the card where the answer is needed
     * @param {Object} answer Definition of the answer which should be removed
     */
    removeAnswer(card, answer) {
        if (!this.solutionHidden()) return;

        let removedAnswers = card.selectedAnswers.remove(a => a.name === answer.name);
        answer = card.answers.find(a => a.name === answer.name);
        answer.amount(answer.amount() + removedAnswers.length);

        // Adjust the menu height
        this.updateAnswerSelectionAnimation(card);
    }

    /**
     * Called inside the template to work around the problem that CSS can only
     * animate the height if the start and end values are explicitly set.
     * Therefor we determine the height of the positive and negative feedbacks
     * and remember them, so that the element can be resized, when one of the
     * feedbacks shall be displayed.
     *
     * @param {DOMElement} element The DOM element whose size needs to be set
     */
    initFeedbackAnimation(element) {
        this.feedbackElement = element.firstElementChild;

        this.feedbackElement.innerHTML = this.quiz.feedbackPositive;
        this.feedbackPositiveHeight = `${this.feedbackElement.clientHeight}px`;

        this.feedbackElement.innerHTML = this.quiz.feedbackNegative;
        this.feedbackNegativeHeight = `${this.feedbackElement.clientHeight}px`;

        this.feedbackElement.innerHTML = "";
        return true;
    }

    /**
     * Called inside the template to toggle the display of the quiz solution.
     */
    toggleSolution() {
        this.closeAnswerSelection();

        if (this.solutionHidden()) {
            // Show solution
            let everythingIsRight = true;

            this.quiz.rows.forEach(row => {
                row.forEach(card => {
                    card.selectedAnswers().forEach(answer => {
                        if (card.correct.find(name => name === answer.name) === undefined) {
                            everythingIsRight = false;
                            answer.class("wrong");
                        }
                    });

                    card.correct.forEach(name => {
                        if (card.selectedAnswers().find(answer => answer.name === name) === undefined) {
                            everythingIsRight = false;
                            let missingAnswer = card.answers.find(answer => answer.name === name);

                            if (missingAnswer != undefined) {
                                card.selectedAnswers.push({
                                    name: missingAnswer.name,
                                    innerHTML: missingAnswer.innerHTML,
                                    addedByUser: false,
                                    class: ko.observable("missing"),
                                });
                            }
                        }
                    });
                });
            });

            if (everythingIsRight) {
                this.feedbackHtml(this.quiz.feedbackPositive);
                this.feedbackElement.style.height = this.feedbackPositiveHeight;
            } else {
                this.feedbackHtml(this.quiz.feedbackNegative);
                this.feedbackElement.style.height = this.feedbackNegativeHeight;
            }

            this.solutionHidden(false);
        } else {
            // Hide solution
            this.quiz.rows.forEach(row => {
                row.forEach(card => {
                    card.selectedAnswers.remove(answer => answer.addedByUser === false);
                    card.selectedAnswers().forEach(answer => answer.class(""));
                });
            });

            this.solutionHidden(true);
        }
    }
}

export default AssignWordsQuiz;
