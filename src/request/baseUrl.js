let baseUrl = "";

if (process.env.NODE_ENV === "development") {
    // baseUrl = "http://192.168.3.28:9000";
    baseUrl = "http://221.11.24.210:8070";
    
    // baseUrl = "http://127.0.0.1:8000";
} else if (process.env.NODE_ENV === "production") {
    baseUrl = "http://221.11.24.210:8070";
}

export default baseUrl;