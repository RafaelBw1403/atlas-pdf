import { isLocalMode } from "./general.helpers";
import { Plan } from "../entities/Plan.entity";
import { Subscription } from "../entities/Subscription.entity";
import { User } from "../entities/User.entity";


export const createFreeSubscription = async (queryRunner: any, user: User) => {
    if (isLocalMode()) {
        // En local, no creamos suscripción
        console.log('Local mode: Skipping free subscription creation');
        return;
    }

    const freePlan = await queryRunner.manager.findOne(Plan, {
        where: [
            { name: 'free' },
            { name: 'Free' },
            { name: 'FREE' }
        ]
    });

    if (!freePlan) {
        throw new Error('Free plan not found');
    }

    const subscription = queryRunner.manager.create(Subscription, {
        user: user,
        plan: freePlan,
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)
    });

    await queryRunner.manager.save(subscription);
}