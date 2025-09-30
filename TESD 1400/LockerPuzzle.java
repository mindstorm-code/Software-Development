public class LockerPuzzle {
    public static void main(String[] args) {
        boolean[] lockers = new boolean[100]; // all start false (closed)

        // Students 1..100
        for (int s = 1; s <= 100; s++) {
            // Toggle every s-th locker: s, 2s, 3s, ...
            for (int l = s; l <= 100; l += s) {
                lockers[l - 1] = !lockers[l - 1]; // convert to 0-based index
            }
        }

        // Build output with exactly one space between numbers, no trailing space
        StringBuilder out = new StringBuilder();
        boolean first = true;
        for (int i = 0; i < lockers.length; i++) {
            if (lockers[i]) {
                if (!first) out.append(' ');
                out.append(i + 1); // convert back to 1-based locker number
                first = false;
            }
        }

        System.out.println(out.toString());
    }
}
