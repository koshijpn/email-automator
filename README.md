# Email Automator

Automate email responses using Node.js, Nodemailer, and IMAP.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)

## Overview

This project automates email responses using Node.js, Nodemailer, and IMAP. It monitors the inbox, detects new emails, and sends automated replies based on predefined conditions.

## Installation

1. Clone the repository:

   git clone https://github.com/koshijpn/email-automator.git
   Navigate to the project directory:

2. Change directory:
  cd next-email-automator
  Install dependencies:


3. install npm
  Set up your environment variables:

4. Create a .env file in the project root and add the following:

    .env file
   
      GMAIL_USER=your-gmail-username@gmail.com
   
      GMAIL_PASSWORD=your-gmail-password
   
      YOUR_NAME=Your Name


   Replace your-gmail-username@gmail.com and your-gmail-password with your Gmail credentials.

## Usage
Run the script to start monitoring the inbox:

node index.js
The script will automatically respond to incoming emails based on predefined conditions.

