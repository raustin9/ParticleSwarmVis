export default class helpers {
    static read_file_sync(filepath) {
        const request = new XMLHttpRequest();
        request.open("GET", filepath, false);
        request.send(null);

        if (request.status === 200) {
            return request.responseText;
        }

        return null;
    }
}
