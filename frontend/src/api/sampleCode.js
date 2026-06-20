// Sample code snippets for the Input Page "load example" buttons.
// "anti_patterns" intentionally triggers all 5 detections from the knowledge base.
// "clean" is the corresponding well-written equivalent (should score Eco-Score A).

export const SAMPLE_CODE = {
  anti_patterns: `global_count = 0
LIMIT = 100

def expensive():
    return sum(range(1000))

def process(data_a, data_b):
    # Anti-pattern: Nested Loop + range(len())
    result = ""
    for i in range(len(data_a)):
        for j in range(len(data_b)):
            if data_a[i] == data_b[j]:
                result += str(data_a[i])

    # Anti-pattern: Repeated function call in loop + Global variable access
    output = []
    for i in range(len(data_a)):
        output.append(expensive())
        global global_count
        global_count += LIMIT

    return result, output

process([1, 2, 3, 4, 5], [3, 4, 5, 6, 7])
`,

  clean: `LIMIT = 100

def expensive():
    return sum(range(1000))

def process(data_a, data_b, limit):
    # Set intersection instead of nested loop -> O(n) instead of O(n^2)
    matched = set(data_a) & set(data_b)

    # Build with list + join instead of += inside a loop
    parts = [str(value) for value in matched]
    result = "".join(parts)

    # Call once outside the loop, reuse the cached result
    cached_value = expensive()
    output = [cached_value + limit for _ in data_a]

    return result, output

process([1, 2, 3, 4, 5], [3, 4, 5, 6, 7], LIMIT)
`,
};
