import {Component, Input, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-js-executor',
  templateUrl: './js-executor.component.html',
  styleUrls: ['./js-executor.component.scss'],
  imports: [ FormsModule, CommonModule]
})
export class JsExecutorComponent implements OnInit {
  @Input() title: string = 'JavaScript Executor';

  codeInput: string = `// Enter your JavaScript code here
console.log('Hello, World!');
document.body.style.backgroundColor = '#f0f0f0';`;
  output: string = '';
  error: string = '';

  ngOnInit(): void {
    this.executeCode();
  }

  executeCode(): void {
    this.output = '';
    this.error = '';

    // Create a safe execution context
    try {
      // Override console.log to capture output
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args) => {
        logs.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
        originalLog.apply(console, args);
      };

      // Create a safe function to execute the code
      const safeFunction = new Function(this.codeInput);
      safeFunction();

      // Restore console.log
      console.log = originalLog;

      // Display output
      if (logs.length > 0) {
        this.output = logs.join('\n');
      } else {
        this.output = 'Code executed successfully (no output).';
      }
    } catch (err) {
      this.error = `Error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  clearCode(): void {
    this.codeInput = '';
    this.output = '';
    this.error = '';
  }

  loadExample(): void {
    this.codeInput = `// Example: Create a colorful element
const div = document.createElement('div');
div.style.padding = '20px';
div.style.margin = '10px';
div.style.borderRadius = '8px';
div.style.backgroundColor = '#4CAF50';
div.style.color = 'white';
div.style.textAlign = 'center';
div.textContent = 'Hello from JavaScript!';

// Find the parent component and append the element
const parent = document.querySelector('.js-executor .output');
if (parent) {
  parent.innerHTML = '';
  parent.appendChild(div);
}`;
    this.executeCode();
  }
}
