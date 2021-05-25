##  1

start
life
end
timeout
因為setTimeout而延遲
## 2

start
life
end
timeout

即使setTimeout是0秒，一樣會被放進webapis，隨後被event loop 丟進stack執行
## 3

foo
bar
baz

順著跑長這樣

## 4

foo
baz
bar

同第二題