// Language configuration for the code editor

export interface Language {
    id: string;
    name: string;
    monaco: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
    { id: 'cpp', name: 'C++', monaco: 'cpp' },
    { id: 'java', name: 'Java', monaco: 'java' },
    { id: 'python', name: 'Python', monaco: 'python' },
    { id: 'javascript', name: 'Node.js', monaco: 'javascript' },
    { id: 'csharp', name: 'C#', monaco: 'csharp' },
    { id: 'kotlin', name: 'Kotlin', monaco: 'kotlin' },
    { id: 'go', name: 'Go', monaco: 'go' },
    { id: 'rust', name: 'Rust', monaco: 'rust' }
];

export const TEMPLATES: Record<string, string> = {
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(0); cin.tie(0);
    
    return 0;
}`,
    java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
    }
}`,
    python: `import sys

def main():
    pass

if __name__ == '__main__':
    main()`,
    javascript: `const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    
});`,
    csharp: `using System;

public class Program
{
    public static void Main()
    {
        
    }
}`,
    kotlin: `import java.util.Scanner

fun main() {
    val scanner = Scanner(System.in)
    
}`,
    go: `package main

import "fmt"

func main() {
    
}`,
    rust: `use std::io;

fn main() {
    
}`
};

export function getLanguageById(id: string): Language | undefined {
    return SUPPORTED_LANGUAGES.find(l => l.id === id);
}

export function getTemplateForLanguage(langId: string): string {
    return TEMPLATES[langId] || '';
}
