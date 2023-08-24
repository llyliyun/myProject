
export let baseIMgUrl = "";
export let undownprojectUrl = ""

if (process.env.NODE_ENV === "development") {
    undownprojectUrl = "https://pms-app-1256720271.cos.ap-beijing.myqcloud.com/";
    baseIMgUrl = "http://221.11.24.210:8070/profile";
} else if (process.env.NODE_ENV === "production") {
    undownprojectUrl = "https://pms-app-1256720271.cos.ap-beijing.myqcloud.com/";
    baseIMgUrl = "http://221.11.24.210:8070/profile";
}
