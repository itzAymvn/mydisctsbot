# My Discord Bot (V1.0.0)

My Discord Bot is a customizable and extendable Discord bot built with TypeScript. This bot offers various functionalities, including fun commands, moderation tools, utility commands, and more.

## Table of Contents

-   [Features](#features)
-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Usage](#usage)
-   [Commands](#commands)
-   [Development](#development)
-   [Contributing](#contributing)
-   [License](#license)

## Features

-   **Fun Commands:** Enhance your server's interaction with commands like `8ball`.
-   **Moderation Tools:** Manage your server efficiently with commands such as `role`.
-   **Utility Commands:** Useful tools like `invite`, `ping`, `reminder`, `status`, and `timezone`.
-   **Event Handling:** Automatically respond to server events like `guildCreate` and `guildDelete`.

## Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/itzAymvn/mydisctsbot
    cd mydisctsbot
    ```

2. **Install dependencies:**

    ```sh
    pnpm install
    ```

3. **Build the project:**
    ```sh
    pnpm build
    ```

## Configuration

1. **Create a `.env` file:**
   Copy the `.env.example` file to `.env` and fill in the necessary configuration variables.

    ```sh
    cp .env.example .env
    ```

2. **Set up your environment variables** in the `.env` file:
    ```
    DISCORD_TOKEN=Your Application Token
    DISCORD_APP_ID=Your Application Client ID
    DISCORD_GUILD_ID=Your Home Server ID
    MONGO_URI=Your MongoDB Connection URI
    DEVELOPER_IDS=List of Developers' Discord IDs
    ```

## Usage

If you have already run the BUILD command, all you have to do is start your bot.

1. **Start the bot:**
    ```sh
    pnpm start
    ```

## Commands

### Fun Commands

-   **8ball:** Answers a question with a random response.
    ```sh
    /8ball [question]
    • question: Your question
    ```

### Moderation Commands

-   **Role:** Manage roles within the server.
    ```sh
    /role add/remove [user] [role]
    • user: The user you want to give/remove role.
    • role: The role.
    ```

### Utility Commands

-   **Invite:** Get the bot's invite link.
    ```sh
    /invite
    ```
-   **Ping:** Check the bot's latency.
    ```sh
    /ping
    ```
-   **Reminder:** Set reminders.
    ```sh
    /reminder [type] [time] [message]
    • type: Duration, Date, Epoch Timestamp
    • time: Duration: 1d1h1m1s | Date (UTC): MM/DD/YYYY HH:MM:SS | Epoch Timestamp: 1672531200
    ```
-   **Status:** Get some information about the bot's status
    ```sh
    /status
    ```
-   **Timezone:** Set or check the timezone.
    ```sh
    /timezone [timezone]
    • timezone: The timezone you want to view the current time in.
    ```

## Development

To contribute to the development of this bot:

1. **Fork the repository** and create your branch from `main`.
2. **Clone your fork** locally.
3. **Create a new branch** for your feature or bugfix:

    ```sh
    git checkout -b feature/YourFeature
    ```

4. **Commit your changes** and push your branch:

    ```sh
    git add .
    git commit -m 'Add your feature'
    git push origin feature/YourFeature
    ```

5. **Create a Pull Request** to have your changes reviewed and merged.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
