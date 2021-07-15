<a href="https://github.com/yutailang0119/action-android-lint/actions"><img alt="action-android-lint status" src="https://github.com/yutailang0119/action-android-lint/workflows/build-test/badge.svg"></a>

# GitHub Action for Android Lint

This Action generates annotations from [Android Lint](https://developer.android.com/studio/write/lint) Report XML.

## Usage

An example workflow(.github/workflows/android-lint.yml) to executing Android Lint follows:

```yml
name: AndroidLint

on:
  pull_request:
    paths:
      - .github/workflows/android-lint.yml
      - '*/src/**'
      - gradle/**
      - '**.gradle'
      - gradle.properties
      - gradlew*

jobs:
  android_lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: set up JDK 1.8
        uses: actions/setup-java@v1
        with:
          java-version: 1.8
      - run: ./gradlew lint
      - uses: yutailang0119/action-android-lint@v1.1.0
        with:
          xml_path: build/reports/*.xml
```

## Author

[Yutaro Muta](https://github.com/yutailang0119)

## References

- Generated from [actions/typescript-action](https://github.com/actions/typescript-action) as template.
- This refer to [mobileposse/github-android-lint-action](https://github.com/mobileposse/github-android-lint-action).

## License

action-android-lint is available under the MIT license. See [the LICENSE file](./LICENSE) for more info.
