import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SupportQueryService , SupportQueryResponse} from '../../service/support-query.service';
import { HttpErrorResponse } from '@angular/common/http';

type ChatScreen =
  | 'welcome'
  | 'queryType'
  | 'edit'
  | 'background'
  | 'compress'
  | 'query';
  

@Component({
  selector: 'app-support-chat',
  imports: [CommonModule],
  templateUrl: './support-chat.component.html',
  styleUrl: './support-chat.component.css'
})
export class SupportChatComponent {

  queryType:
  | 'PASSWORD'
  | 'IMAGE_UPLOAD'
  | 'RECYCLE_BIN'
  | 'OTHER'
  | null = null;

  queryText = '';

queryError = '';
isSubmitting = false;
querySubmitted = false;

submittedQueryId: number | null = null;

readonly maxQueryLength = 1000;


   isOpen = false;

  currentScreen: ChatScreen = 'welcome';


  constructor(
  private supportQueryService: SupportQueryService
) {}


  openChat(): void {

    this.isOpen = true;

    //this.currentScreen = 'welcome';

  }


  closeChat(): void {

    this.isOpen = false;
    this.resetChat();

  }

  closQeuery():void{
    this.resetChat();
    this.currentScreen = 'welcome';

  }

  private resetChat(): void {

    this.currentScreen = 'welcome';

    this.queryText = '';

    this.queryError = '';

    this.isSubmitting = false;

    this.querySubmitted = false;

    this.submittedQueryId = null;

}

 showScreen(screen: ChatScreen): void {

    if (screen === 'query') {

        this.queryText = '';

        this.queryError = '';

        this.isSubmitting = false;

        this.querySubmitted = false;

        this.submittedQueryId = null;

    }

    this.currentScreen = screen;

}


  goBack(): void {

    this.currentScreen = 'welcome';

  }

  onQueryChange(value: string): void {

    this.queryText = value;

    if (this.queryText.trim().length > 0) {
        this.queryError = '';
    }

}

submitQuery(): void {

  if (this.isSubmitting) {
    return;
}

    if (!this.queryText.trim()) {

        this.queryError =
            'Please describe your problem before submitting.';

        return;
    }

    if (this.queryText.trim().length < 10) {

        this.queryError =
            'Please provide a little more detail about your problem.';

        return;
    }
    if (!this.queryType) {

    this.queryError =
        'Please select a query type.';

    return;
}

    this.queryError = '';

    this.isSubmitting = true;

    this.supportQueryService.createQuery({
        query: this.queryText.trim(),
         requestId: this.generateRequestId(),
         queryType: this.queryType!
    }).subscribe({

        next: (response: SupportQueryResponse) => {

            this.isSubmitting = false;

            if (response.success) {

              this.submittedQueryId =
                response.queryId;

              this.querySubmitted = true;

              this.queryText = '';

              this.queryError = '';

            } else {

                this.queryError =
                    response.message ||
                    'Unable to submit your query.';
            }
        },

      error: (error: HttpErrorResponse) => {

        console.error(
          'Support query submission failed:',
          error
        );

        this.isSubmitting = false;

        this.queryError =
          error.error?.message ||
          'Unable to submit your query. Please try again.';
      }

    });
}

private generateRequestId(): string {

    return crypto.randomUUID();

}

minimizeChat(): void {

    this.isOpen = false;

}

selectQueryType(
  type:
    | 'PASSWORD'
    | 'IMAGE_UPLOAD'
    | 'RECYCLE_BIN'
    | 'OTHER'
): void {

    this.queryType = type;

    this.queryText = '';

    this.queryError = '';

    this.querySubmitted = false;

    this.submittedQueryId = null;

    this.currentScreen = 'query';

}

}
