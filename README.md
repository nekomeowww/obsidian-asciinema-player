English | [简体中文](https://github.com/nekomeowww/obsidian-asciinema-player/blob/master/doc/README-zhcn.md)

## Obsidian `asciinema-player` Plugin

This is a [Obsidian](https://obsidian.md) plugin which supports embedding [asciicast](https://github.com/asciinema/asciinema/blob/develop/doc/asciicast-v2.md) files into your Markdown files.

For more details about [asciicast](https://github.com/asciinema/asciinema/blob/develop/doc/asciicast-v2.md), you may want to visit [asciinema recorder](https://github.com/asciinema/asciinema) and [asciinema.org](https://asciinema.org).

## Installation

### From Obsidian Community Plugin

**Attention: Not published to Obsidian Community Plugin yet**

### Manually

1. Clone

```shell
$ git clone https://github.com/nekomeowww/obsidian-asciinema-player <path to obsidian vault>/.obsidian/plugins
```

2. Build from source code

```shell
$ pnpm i && pnpm build
```

3. Active plugin in **Obsidian Community Plugin** tab

####

## Usage

### Install `asciinema recorder`

1. By using optional package manager `brew` on macOS

```shell
$ brew install asciinema
```

2. By using `pip3`

```shell
$ sudo pip3 install asciinema
```

### Create `asciicast` file

```shell
$ asciinema rec <path to a asciicast file ending with .cast>
```

Such as

```shell
$ asciinema rec demo.cast
```

Insert the file into your Obsidian Vault.

### Markdown markup syntax

```markdown
![](asciinema:<path to a asciicast file ending with .cast>)
```
