[English](https://github.com/nekomeowww/obsidian-asciinema-player/blob/master/README.md) | 简体中文

## Obsidian `asciinema-player` 插件

这是一个支持将 [asciicast](https://github.com/asciinema/asciinema/blob/develop/doc/asciicast-v2.md)（asciinema 工具录制的命令行记录文件）嵌入到 [Obsidian（黑曜石）](https://obsidian.md) Markdown 文件的插件

想要了解更多 [asciicast](https://github.com/asciinema/asciinema/blob/develop/doc/asciicast-v2.md) 文件的信息，可以访问一下 [asciinema recorder](https://github.com/asciinema/asciinema) 和 [asciinema.org](https://asciinema.org).

## 安装

### 通过 Obsidian 第三方插件列表

**主题：暂未在 Obsidian 第三方插件中上架**

### 手动

1. 克隆

```shell
$ git clone https://github.com/nekomeowww/obsidian-asciinema-player <知识库路径>/.obsidian/plugins
```

2. 从源码编译

```shell
$ pnpm i && pnpm build
```

3. 在 **Obsidian 第三方插件** 标签页中激活

## 使用方法

## 安装 `asciinema` 录制程序

1. 通过 macOS 可选的 `brew`（[Homebrew](https://brew.sh)） 软件包管理器安装

```shell
$ brew install asciinema
```

2. 通过 pip3 安装

```shell
$ sudo pip3 install asciinema
```

### 通过 `asciinema` 录制并创建 `asciicast` 文件

```shell
$ asciinema rec <结尾为 .cast 的 asciicast 文件路径>
```

比如

```shell
$ asciinema rec demo.cast
```

把录制好的文件放到 Obsidian 的知识库下。

### Markdown 标记语法

```markdown
![](asciinema:<结尾为 .cast 的 asciicast 文件路径>)
```


