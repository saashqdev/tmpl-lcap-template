``` vue
<template>
<div>
    <div>The current date is:{{ $n(100, 'currency', 'en-US') }}</div>
</div>
</template>
<script>
import { utils } from 'cloud-ui.kubevue';

export default {
    i18n: {
        locale: 'en-US', // Set region
        messages: {
            en: {
                car: 'car | cars',
                message: {
                    hello: 'hello world',
                },
            },
        },
    },
    filters: {
        date: utils.dateFormatter.format,
    },
    data() {
        return {
            now: new Date(),
        };
    },
};
</script>
```



The general form of a formatter is a class containing a `format(value, ...settings)` method.

``` js
class SomeFormatter {
    format(value, ...settings) {
        ...
        return result;
    }
}
```

After the data is formatted by some formatters, the information is not lost and can still be converted into original data. Such formatters are called reversible formatters, and they also contain a `parse(value, ...settings)` method.

``` js
class SomeFormatter {
    format(value, ...settings) {
        // ...
        return result;
    }

    parse(value, ...settings) {
        // ...
        return result;
    }
}
```

### For Filters

In addition to directly converting data when called as a method, the most common use of formatters is that they can be configured as Vue filters, which are easily used in templates.

```vue
<template>
<div>
    <div>The current date is: {{ now | date('YYYY-MM-DD') }}</div>
</div>
</template>
<script>
import { utils } from 'cloud-ui.kubevue';

export default {
    filters: {
        date: utils.dateFormatter.format,
    },
    data() {
        return {
            now: new Date(),
        };
    },
};
</script>
```
