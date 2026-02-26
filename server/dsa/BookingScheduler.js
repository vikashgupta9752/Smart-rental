class BookingScheduler {
    static hasConflict(newBooking, existingBookings) {
        // newBooking: { start: Number, end: Number }
        // existingBookings: Array of { start: Number, end: Number }

        // Sort existing bookings by start time (though for conflict check we can just iterate)
        for (let booking of existingBookings) {
            if (newBooking.start < booking.end && newBooking.end > booking.start) {
                return true; // Overlap detected
            }
        }
        return false;
    }

    static getNonOverlappingBookings(bookings) {
        // Greedy Interval Scheduling
        // Sort by end time
        const sorted = [...bookings].sort((a, b) => a.end - b.end);
        const result = [];
        let lastEnd = -Infinity;

        for (let booking of sorted) {
            if (booking.start >= lastEnd) {
                result.push(booking);
                lastEnd = booking.end;
            }
        }

        return result;
    }
}

module.exports = BookingScheduler;
