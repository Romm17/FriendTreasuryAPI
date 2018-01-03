import { SubscriptionList } from './../../shared/models/subscription.model';
import { ResponsiveDetectorService } from './../../shared/services/responsive-detector.service';
import { PaymentsService } from './../../shared/services/payments.service';
import { AppPreferencesService } from './../../shared/services/app-preferences.service';
import { PaymentFiltersService } from './../payments/services/payment-filters.service';
import { InviteService } from './../../shared/services/invite.service';
import { CreateGroupComponent } from '../create-group/create-group.component';
import { AuthService } from './../../shared/services/auth.service';
import { PaymentFilters } from './../../shared/models/payments-filters.model';
import { MdlDialogService } from '@angular-mdl/core';
import { User } from './../../shared/models/user.model';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { CreatePaymentModel } from './../../shared/models/create-payment.model';
import { GroupService } from './../../shared/services/group.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Group } from '../../shared/models/group.model';
import { Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { UserStorageService } from '../../shared/services/user-storage.service';
import { Observable } from 'rxjs/Observable';
import { Preferences } from '../../shared/models/preferences.model';
@Component({
    selector: 'ft-main-page',
    templateUrl: 'main-page.component.html',
    styleUrls: ['main-page.component.scss']
})
export class MainPageComponent implements OnInit, OnDestroy {
    groups: Array<Group> = new Array();
    subscription: SubscriptionList;
    preferences: Preferences;
    constructor(
        private groupService: GroupService,
        private paymentService: PaymentsService,
        private userService: UserService,
        private userStorageService: UserStorageService,
        private authService: AuthService,
        private toastrManager: ToastsManager,
        private dialogService: MdlDialogService,
        private router: Router,
        private inviteService: InviteService,
        private filtersService: PaymentFiltersService,
        public responsive: ResponsiveDetectorService,
        private preferencesService: AppPreferencesService
    ) {
      const subscription = this.preferencesService.preferencesChanged.subscribe(data => this.preferences = data);
      this.subscription = new SubscriptionList();
      this.subscription.add(subscription);
    }

    ngOnInit(): void {
        this.preferencesService.asign({currentUser: this.userStorageService.get().user});
        this.updateGroupsList();
        this.updateCurrentUserProfile();
    }
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    updateCurrentUserProfile() {
      const userEnrichSubscription: Subscription = this.userService.enrich(this.preferences.currentUser).subscribe(
        (data) => this.preferencesService.asign({currentUser: data}),
        err => {
            console.log(err);
            this.toastrManager.error('Error');
        },
        () => userEnrichSubscription.unsubscribe()
    );
    }

    updateGroupsList() {
        this.subscription.add(this.groupService.getWithPayments(this.preferences.currentGroup.id).subscribe(
            (data) => {
                this.groups = data;
                const name = this.inviteService.get();
                if (!!name) {
                    this.preferencesService.asign({
                      currentGroup: data.find(group => group.name === name)
                    });
                    this.inviteService.destroy();
                }
            },
            err => {
                console.log(err);
                this.toastrManager.error('Error');
            }
        ));
    }

    onGroupSelect(group: Group): void {
        this.preferencesService.asign({
            currentGroup: group,
        });
        this.filtersService.changeFilters(new PaymentFilters({
            group: group.id
        }));
        this.userService.getUsersInGroup(group.id).subscribe(
            (data) => this.preferencesService.asign({currentGroup: Object.assign(this.preferences.currentGroup, {users: data})}),
            (err) => {
                console.log(err);
                this.toastrManager.error('Error');
            }
        );
    }

    onCreatePaymentComplete(model: CreatePaymentModel) {
        model.group = this.preferences.currentGroup.id;
        model.shallIPayForMyself = model.shallIPayForMyself ? 1 : 0;
        this.paymentService.create(model).subscribe(
            (success) => {
                this.filtersService.reload();
                this.updateGroupsList();
                this.updateCurrentUserProfile();
                this.toastrManager.success('Payment Created');
            },
            (err) => {
                this.toastrManager.error('Payment error');
            }
        );
    }

    logout() {
        this.authService.logout();
    }

    isCurrentGroupSelected(): boolean {
        return !!this.preferences.currentGroup;
    }

    generateInvite(): string {
        if (!this.preferences.currentGroup) {
            return '';
        }
        return this.inviteService.generate(this.preferences.currentGroup.name);
    }

    onGenerationgSuccess() {
        this.toastrManager.success('Link copied to clipboard');
    }

    onGenerationError() {
        this.toastrManager.error('Cannot copy link');
    }
}
