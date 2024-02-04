export const calculateMovementDirection = (prevCoords, currentCoords) => {
    const latDiff = currentCoords.latitude - prevCoords.latitude;
    const lonDiff = currentCoords.longitude - prevCoords.longitude;

    if (Math.abs(latDiff) > Math.abs(lonDiff)) {
        // Movement in the vertical direction (up or down)
        if (latDiff > 0) {
            return 'down';
        } else {
            return 'up';
        }
    } else {
        // Movement in the horizontal direction (left or right)
        if (lonDiff > 0) {
            return 'right';
        } else {
            return 'left';
        }
    }
};
