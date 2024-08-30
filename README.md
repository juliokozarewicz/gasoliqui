# Gasoliqui API

The Gasoliqui API is a robust and efficient solution for reading and monitoring water and gas consumption data. It leverages Google's advanced AI, Gemini, to provide detailed and precise insights.

## Technologies

- **Node.js**: JavaScript runtime for server-side execution.
- **NestJS**: Framework for building scalable and efficient server-side applications with Node.js.
- **Database**: SQLite for lightweight and efficient data storage.
- **Documentation**: Available via Swagger at `/api/docs`.

## Features

- **Reading and Monitoring**: Captures and analyzes water and gas consumption data.
- **Advanced Insights**: Utilizes Google's Gemini AI for detailed analytics.
- **Logs**: Integrated logging system for effective monitoring and diagnostics.
- **Static Files**: Support for static files for simplified configuration and operation.

## Installation

### Using Docker

1. **Ensure Docker and Docker Compose are installed**. You can follow the installation instructions on the [official Docker website](https://docs.docker.com/get-docker/).

2. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/gasoliqui-api.git
    cd gasoliqui-api
    ```

3. **Create a `.env` file**:
    Create a file named `.env` in the root directory of the project and add the following environment variable:
    ```env
    GEMINI_API_KEY=your_google_gemini_api_key
    ```

4. **Build and start the containers**:
    ```bash
    docker-compose up --build
    ```

    This command will build the Docker image for the application and start the necessary containers.

5. **Access the application**:
    The API will be available at [http://localhost:3000](http://localhost:3000).

6. **Documentation**:
    Access the API documentation at [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

### Without Docker

If you prefer not to use Docker, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/gasoliqui-api.git
    cd gasoliqui-api
    ```

2. **Create a `.env` file**:
    Create a file named `.env` in the root directory of the project and add the following environment variable:
    ```env
    GEMINI_API_KEY=your_google_gemini_api_key
    ```

3. **Install the dependencies**:
    ```bash
    npm install
    ```

4. **Start the application**:
    ```bash
    npm run start
    ```

## Documentation

Access the API documentation at [http://localhost:3000/api/docs](http://localhost:3000/api/docs) after starting the application.

## Logs

Logs are generated and stored according to the default configuration. Check the log files for monitoring and diagnostics.

## Static Files

The API supports static files, which can be configured as needed.

## Contributing

If you wish to contribute to the project, please submit a pull request or open an issue on GitHub.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions and support, please contact [your.email@example.com](mailto:your.email@example.com).
