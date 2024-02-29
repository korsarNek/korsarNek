class WarehouseWrapper extends Array {
    each(callback) {
        this.forEach(callback);
    }

    toArray() {
        return this;
    }

    sort(key, ascending) {
        return super.sort((a, b) => {
            if (a[key] < b[key]) {
                return ascending ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return ascending ? 1 : -1;
            }
            return 0;
        });
    }

    limit(count) {
        return this.slice(0, count);
    }
}

function createWarehouseWrapper(array) {
    if ('toArray' in array)
        array = array.toArray();
    return new WarehouseWrapper(...array);
}

module.exports = createWarehouseWrapper;