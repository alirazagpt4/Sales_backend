export const getFlatIds = (user) => {
    let ids = [user.id];
    if (user.subordinates && user.subordinates.length > 0) {
        user.subordinates.forEach(sub => {
            ids = [...ids, ...getFlatIds(sub)]; // Apne aap ko dobara call karega
        });
    }
    return ids;
};