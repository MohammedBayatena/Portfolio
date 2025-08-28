import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FilecontentService {
  constructor() {}

  private fileContents: { [key: string]: string } = {
    coverLetter: `Mohammed Bayatena
Birzeit, Palestine
[mohammedbayatena@gmail.com](mailto:mohammedbayatena@gmail.com) | +970569916752
[LinkedIn](https://linkedin.com/in/mohammed-bayatena) | [GitHub](https://github.com/MohammedBayatena)

---

Dear Hiring Manager,

I am writing to express my interest in a backend developer position within your organization. With over four years of experience in developing and maintaining scalable backend systems using **C# .NET Core**, I have built RESTful APIs, implemented robust security with **JWT and OAuth 2.0**, and deployed cloud-based services through **Azure DevOps and Docker**.

At AppiaTech (Boeing), I contributed to the creation of 50+ new backend features across multiple microservices and significantly improved system efficiency by optimizing databases and reducing code redundancies by over 40%. My work style emphasizes clean code, test-driven development, and cross-functional collaboration.

I am excited about the opportunity to bring my skills in backend engineering, performance optimization, and API integration to a dynamic team. I would welcome the chance to discuss how I can add value to your projects.

Thank you for considering my application. I look forward to the opportunity to speak further.

Sincerely,
Mohammed Bayatena`,
  };

  public getFileContent(fileId: string): string | null {
    return this.fileContents[fileId] || null;
  }
}
