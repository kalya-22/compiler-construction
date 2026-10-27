CC = gcc
LEX = flex
TARGET = remover
SRC = remover.l
TEST_FILE = input_test.c

all: $(TARGET)

$(TARGET): lex.yy.c
	$(CC) lex.yy.c -o $(TARGET)

lex.yy.c: $(SRC)
	$(LEX) $(SRC)

run: $(TARGET)
	./$(TARGET) $(TEST_FILE)

clean:
	rm -f $(TARGET) $(TARGET).exe lex.yy.c

.PHONY: all run clean
