using System;

namespace BACKEND.Utils
{
    public static class TimeZoneHelper
    {
        // TimeZoneInfo cho múi giờ Việt Nam (UTC+7)
        private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

        /// <summary>
        /// Lấy thời gian hiện tại theo múi giờ Việt Nam
        /// </summary>
        /// <returns>DateTime theo múi giờ Việt Nam</returns>
        public static DateTime GetVietnamNow()
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VietnamTimeZone);
        }

        /// <summary>
        /// Chuyển đổi từ UTC sang giờ Việt Nam
        /// </summary>
        /// <param name="utcDateTime">Thời gian UTC</param>
        /// <returns>Thời gian theo múi giờ Việt Nam</returns>
        public static DateTime ConvertUtcToVietnam(DateTime utcDateTime)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, VietnamTimeZone);
        }

        /// <summary>
        /// Chuyển đổi từ giờ Việt Nam sang UTC
        /// </summary>
        /// <param name="vietnamDateTime">Thời gian theo múi giờ Việt Nam</param>
        /// <returns>Thời gian UTC</returns>
        public static DateTime ConvertVietnamToUtc(DateTime vietnamDateTime)
        {
            return TimeZoneInfo.ConvertTimeToUtc(vietnamDateTime, VietnamTimeZone);
        }

        /// <summary>
        /// Lấy thời gian hiện tại theo múi giờ Việt Nam nhưng lưu dưới dạng UTC để tương thích với database
        /// Phương thức này được khuyến nghị sử dụng khi lưu vào database
        /// </summary>
        /// <returns>DateTime UTC tương ứng với thời gian hiện tại VN</returns>
        public static DateTime GetVietnamNowAsUtc()
        {
            var vietnamNow = GetVietnamNow();
            return ConvertVietnamToUtc(vietnamNow);
        }
    }
}
