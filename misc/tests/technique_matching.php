<?php
/*
 * Technique-matching harness (Follow Phase step 1, php:stMatchingTechniques).
 *
 * Runs the allocation block of stMatchingTechniques, extracted from a game file, on a grid of inputs and checks it
 * against two independent brute forces: the most sets, then the least New Rubber, then the fewest Technique Tokens.
 * With a baseline file (for example `git show <commit>:firstascent.game.php`), it also compares the two versions.
 *
 * Usage (CLI only, from the repo root):
 *   php misc/tests/technique_matching.php firstascent.game.php [baseline_game.php]
 * Exit code 0 when every check passes, 1 otherwise.
 *
 * Inputs per case: face-up technique symbols per type, Technique Tokens per type, wilds (Sendy Jammer's Gear Cards
 * and the five wild-symbol Gear Cards) and New Rubber (0 or 1).
 */

if (PHP_SAPI !== 'cli') { exit; }

const TYPES = ['precision', 'balance', 'pain_tolerance', 'power'];

// Each marker pair delimits the allocation block: from the per-player initializations to the line that sets
// $new_rubber_used. The second pair is the version before P0.2 (Phases 1-3 with is_pure_wild_on_empty).
const MARKERS = [
    ["            \$gained_points = ['precision' => 0, 'balance' => 0, 'pain_tolerance' => 0, 'power' => 0];",
     "            \$new_rubber_used = \$best_allocation['rubber'] === 1;"],
    ["            \$initial_wild_techniques = \$techniques['wild'];",
     "            \$wild_techniques = \$initial_wild_techniques - \$committed_wild_used;"],
];

function extract_block(string $file): string {
    $lines = preg_split('/\r\n|\n/', file_get_contents($file));
    foreach (MARKERS as [$first, $last]) {
        $s = array_keys($lines, $first, true);
        $e = array_keys($lines, $last, true);
        if (count($s) === 1 && count($e) === 1 && $e[0] > $s[0]) {
            return implode("\n", array_slice($lines, $s[0], $e[0] - $s[0] + 1));
        }
    }
    fwrite(STDERR, "allocation block not found in $file\n");
    exit(2);
}

if ($argc < 2) { fwrite(STDERR, "usage: php technique_matching.php <game file> [baseline game file]\n"); exit(2); }
$blocks = ['new' => extract_block($argv[1])];
if ($argc > 2) { $blocks['old'] = extract_block($argv[2]); }

// The block runs inside a method, so $this->getHandSummitBetaTokens() is stubbed: New Rubber is Summit Beta 6.
$methods = '';
foreach ($blocks as $name => $code) {
    $methods .= "function run_$name(\$techniques, \$tokens, \$id = 1) {\n$code\nreturn [\$gained_points, \$played_tokens, \$new_rubber_used];\n}\n";
}
eval("class Harness { public \$hand = []; function getHandSummitBetaTokens(\$id) { return \$this->hand; }\n$methods }");
$harness = new Harness();

function run(string $name, array $n, array $k, int $W, int $R): array {
    global $harness;
    $harness->hand = $R ? ['91' => '6'] : [];
    $tokens = $k + ['gear' => 0, 'face' => 0, 'crack' => 0, 'slab' => 0];
    [$g, $p, $rubber] = $harness->{"run_$name"}($n + ['wild' => $W], $tokens);
    return ['sets' => (int)array_sum($g), 'rubber' => $rubber ? 1 : 0, 'tokens' => (int)array_sum($p), 'gained' => $g, 'played' => $p];
}

// Brute force 1 (small inputs): every number of sets per type and of wild-only sets.
function brute_enumerate(array $n, array $k, int $W, int $R): array {
    $best = null;
    $ranges = [];
    foreach (TYPES as $t) { $ranges[] = range(0, intdiv($n[$t] + $k[$t] + $W + $R, 3)); }
    $combos = [[]];
    foreach ($ranges as $range) {
        $next = [];
        foreach ($combos as $c) { foreach ($range as $v) { $next[] = array_merge($c, [$v]); } }
        $combos = $next;
    }
    foreach ($combos as $s) {
        for ($r = 0; $r <= $R; $r++) {
            $need = 0; $beyond_tokens = 0;
            foreach (TYPES as $i => $t) {
                $nt = max(0, 3 * $s[$i] - $n[$t]);
                $need += $nt; $beyond_tokens += max(0, $nt - $k[$t]);
            }
            for ($w = 0; 3 * $w <= $W + $r; $w++) {
                $units = $W + $r - 3 * $w;
                if ($beyond_tokens > $units) { continue; }
                $key = [-(array_sum($s) + $w), $r, max(0, $need - $units)];
                if ($best === null || $key < $best) { $best = $key; }
            }
        }
    }
    return ['sets' => -$best[0], 'rubber' => $best[1], 'tokens' => $best[2]];
}

// Brute force 2 (any size): dynamic programming over the wild units (wilds + New Rubber) given to each type.
function brute_dp(array $n, array $k, int $W, int $R): array {
    $best = null;
    for ($r = 0; $r <= $R; $r++) {
        $units = $W + $r;
        $dp = [0 => [0, 0]]; // units given to types so far => [sets, tokens]
        foreach (TYPES as $t) {
            $next = [];
            foreach ($dp as $b => [$sets, $tok]) {
                for ($x = 0; $b + $x <= $units; $x++) {
                    for ($s = 0; 3 * $s <= $n[$t] + $k[$t] + $x; $s++) {
                        $cand = [$sets + $s, $tok + max(0, 3 * $s - $n[$t] - $x)];
                        $cur = $next[$b + $x] ?? null;
                        if ($cur === null || $cand[0] > $cur[0] || ($cand[0] == $cur[0] && $cand[1] < $cur[1])) { $next[$b + $x] = $cand; }
                    }
                }
            }
            $dp = $next;
        }
        foreach ($dp as $b => [$sets, $tok]) {
            $key = [-($sets + intdiv($units - $b, 3)), $r, $tok];
            if ($best === null || $key < $best) { $best = $key; }
        }
    }
    return ['sets' => -$best[0], 'rubber' => $best[1], 'tokens' => $best[2]];
}

// The sets the allocation reports must fit in the symbols it says it used.
function consistent(array $res, array $n, array $k, int $W, int $R): bool {
    $wild_needed = 3 * ($res['gained']['wild'] ?? 0);
    foreach (TYPES as $t) {
        if ($res['played'][$t] < 0 || $res['played'][$t] > $k[$t]) { return false; }
        $wild_needed += max(0, 3 * $res['gained'][$t] - $n[$t] - $res['played'][$t]);
    }
    return $res['rubber'] <= $R && $wild_needed <= $W + $res['rubber'];
}

$failures = 0;
function check_case(array $n, array $k, int $W, int $R, array &$stats, bool $enumerate) {
    global $blocks, $failures;
    $new = run('new', $n, $k, $W, $R);
    $expected = brute_dp($n, $k, $W, $R);
    if ($enumerate) {
        $enum = brute_enumerate($n, $k, $W, $R);
        if ($enum !== $expected) { $stats['brute_forces_disagree']++; $failures++; }
    }
    $stats['cases']++;
    $got = ['sets' => $new['sets'], 'rubber' => $new['rubber'], 'tokens' => $new['tokens']];
    if ($got !== $expected) {
        $stats['not_optimal']++; $failures++;
        if ($stats['not_optimal'] <= 3) { echo '  not optimal: ', json_encode([$n, $k, $W, $R, $got, $expected]), "\n"; }
    }
    if (!consistent($new, $n, $k, $W, $R)) { $stats['inconsistent']++; $failures++; }
    if (isset($blocks['old'])) {
        $old = run('old', $n, $k, $W, $R);
        if ($old['sets'] > $new['sets']) { $stats['baseline_more_sets']++; $failures++; }
        elseif ($old['sets'] < $new['sets']) { $stats['baseline_fewer_sets']++; }
        elseif ($old['tokens'] != $new['tokens'] || $old['rubber'] != $new['rubber']) { $stats['same_sets_tokens_or_rubber_differ']++; }
        elseif ($old['gained'] != $new['gained'] || $old['played'] != $new['played']) { $stats['same_sets_only_labels_differ']++; }
        else { $stats['identical']++; }
    }
}

function new_stats(): array {
    global $blocks;
    $s = ['cases' => 0, 'not_optimal' => 0, 'inconsistent' => 0, 'brute_forces_disagree' => 0];
    if (isset($blocks['old'])) {
        $s += ['baseline_more_sets' => 0, 'baseline_fewer_sets' => 0, 'same_sets_tokens_or_rubber_differ' => 0,
               'same_sets_only_labels_differ' => 0, 'identical' => 0];
    }
    return $s;
}

function grid(array $ranges): Generator {
    $keys = array_keys($ranges);
    $idx = array_fill_keys($keys, 0);
    while (true) {
        $vals = [];
        foreach ($keys as $key) { $vals[$key] = $ranges[$key][$idx[$key]]; }
        yield $vals;
        foreach (array_reverse($keys) as $key) {
            if (++$idx[$key] < count($ranges[$key])) { continue 2; }
            $idx[$key] = 0;
        }
        return;
    }
}

function case_from(array $v): array {
    $n = []; $k = [];
    foreach (TYPES as $t) { $n[$t] = $v["n_$t"] ?? 0; $k[$t] = $v["k_$t"] ?? 0; }
    return [$n, $k, $v['W'], $v['R']];
}

$runs = [
    'A (small grid, both brute forces): cards 0-3/0-3/0-2/0-1, tokens 0-2/0-2/0/0-1, wilds 0-6' => [
        ['n_precision' => range(0, 3), 'n_balance' => range(0, 3), 'n_pain_tolerance' => range(0, 2), 'n_power' => range(0, 1),
         'k_precision' => range(0, 2), 'k_balance' => range(0, 2), 'k_power' => range(0, 1), 'W' => range(0, 6), 'R' => [0, 1]], true],
    'B (extended grid): cards 0-3/0-2/0-1/0-1, tokens 0-6/0-6/0-1/0-1, wilds 0-9' => [
        ['n_precision' => range(0, 3), 'n_balance' => range(0, 2), 'n_pain_tolerance' => range(0, 1), 'n_power' => range(0, 1),
         'k_precision' => range(0, 6), 'k_balance' => range(0, 6), 'k_pain_tolerance' => range(0, 1), 'k_power' => range(0, 1),
         'W' => range(0, 9), 'R' => [0, 1]], false],
];
foreach ($runs as $label => [$ranges, $enumerate]) {
    $stats = new_stats();
    foreach (grid($ranges) as $v) { check_case(...case_from($v), stats: $stats, enumerate: $enumerate); }
    echo "Run $label\n  ", json_encode($stats), "\n";
}

// C: random cases over the full range (cards 0-4, tokens 0-6 per type, wilds 0-9), reproducible seed.
mt_srand(20261022);
$stats = new_stats();
for ($i = 0; $i < 20000; $i++) {
    $v = ['W' => mt_rand(0, 9), 'R' => mt_rand(0, 1)];
    foreach (TYPES as $t) { $v["n_$t"] = mt_rand(0, 4); $v["k_$t"] = mt_rand(0, 6); }
    check_case(...case_from($v), stats: $stats, enumerate: false);
}
echo "Run C (20000 random cases): cards 0-4, tokens 0-6 per type, wilds 0-9\n  ", json_encode($stats), "\n";

// Named cases from the P0.2 trace.
$named = [
    '3 wilds only' => [[], [], 3, 0],
    '2 wilds + 1 Balance token' => [[], ['balance' => 1], 2, 0],
    '2 wilds + New Rubber' => [[], [], 2, 1],
    '2 Balance tokens + New Rubber' => [[], ['balance' => 2], 0, 1],
    '3 Balance tokens, no card' => [[], ['balance' => 3], 0, 0],
    '1 Balance card + 2 wilds' => [['balance' => 1], [], 2, 0],
    '1 Balance token + 1 Precision token + 4 wilds' => [[], ['balance' => 1, 'precision' => 1], 4, 0],
    '1 Balance card + 2 Balance tokens + 3 wilds' => [['balance' => 1], ['balance' => 2], 3, 0],
    '1 Balance card + 7 wilds' => [['balance' => 1], [], 7, 0],
    '6 Balance tokens, no card' => [[], ['balance' => 6], 0, 0],
    '1 Precision card + 1 Balance token + 1 Power token + 6 wilds' => [['precision' => 1], ['balance' => 1, 'power' => 1], 6, 0],
    '2 Precision tokens + 5 wilds' => [[], ['precision' => 2], 5, 0],
    '3 Power cards + 3 Balance cards' => [['power' => 3, 'balance' => 3], [], 0, 0],
];
echo "Named cases\n";
foreach ($named as $label => [$nn, $kk, $W, $R]) {
    $n = array_merge(array_fill_keys(TYPES, 0), $nn);
    $k = array_merge(array_fill_keys(TYPES, 0), $kk);
    $fmt = fn($r) => sprintf('%d set(s) %s, tokens %s%s', $r['sets'], json_encode(array_filter($r['gained'])),
        json_encode(array_filter($r['played']) ?: new stdClass), $r['rubber'] ? ', New Rubber' : '');
    $line = sprintf('  %-60s new: %s', $label, $fmt(run('new', $n, $k, $W, $R)));
    if (isset($blocks['old'])) { $line .= '   | baseline: ' . $fmt(run('old', $n, $k, $W, $R)); }
    echo $line, "\n";
}

echo $failures ? "FAILED: $failures check(s)\n" : "All checks passed\n";
exit($failures ? 1 : 0);
