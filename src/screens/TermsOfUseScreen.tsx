import React from 'react';
import { Text } from 'react-native';
import LegalDocScreen, { legalStyles as s } from '../components/LegalDocScreen';

export default function TermsOfUseScreen() {
  return (
    <LegalDocScreen title="Terms of Use">
      <Text style={s.meta}>Last updated: June 28, 2026</Text>

      <Text style={s.paragraph}>
        These Terms of Use govern your use of Setly. By creating an account or using the app, you
        agree to these terms.
      </Text>

      <Text style={s.heading}>The Service</Text>
      <Text style={s.paragraph}>
        Setly lets you keep a journal of concerts and music events you've attended, share them
        with friends, and interact through comments and likes. Event details may be sourced from
        third-party providers (such as Ticketmaster); we don't guarantee their accuracy.
      </Text>

      <Text style={s.heading}>Your Account</Text>
      <Text style={s.paragraph}>
        You're responsible for keeping your login credentials secure and for activity that
        happens under your account. Provide accurate information when creating your account.
      </Text>

      <Text style={s.heading}>Your Content</Text>
      <Text style={s.paragraph}>
        You own the journal entries, photos, comments, and other content you post. By posting
        content, you grant us a license to store and display it within the app to you and the
        friends you've connected with, solely to operate the service.
      </Text>

      <Text style={s.heading}>Acceptable Use</Text>
      <Text style={s.paragraph}>You agree not to:</Text>
      <Text style={s.bullet}>• Post content that is illegal, harassing, abusive, or infringes someone else's rights.</Text>
      <Text style={s.bullet}>• Impersonate another person or misrepresent your affiliation with anyone.</Text>
      <Text style={s.bullet}>• Use the app to spam, scrape, or interfere with other users.</Text>
      <Text style={s.bullet}>• Attempt to access another user's account or data without authorization.</Text>

      <Text style={s.paragraph}>
        You can report comments, replies, or events that violate these terms, and block users you
        don't want to interact with.
      </Text>

      <Text style={s.heading}>Content Removal & Account Actions</Text>
      <Text style={s.paragraph}>
        We may remove content or suspend or terminate accounts that violate these terms. You can
        delete your own account at any time from Settings → Delete Account, which permanently
        removes your data as described in our Privacy Policy.
      </Text>

      <Text style={s.heading}>Disclaimer</Text>
      <Text style={s.paragraph}>
        Setly is provided "as is" and "as available" without warranties of any kind. We don't
        guarantee the service will be uninterrupted, error-free, or that event information
        sourced from third parties is accurate or current.
      </Text>

      <Text style={s.heading}>Limitation of Liability</Text>
      <Text style={s.paragraph}>
        To the fullest extent permitted by law, we are not liable for any indirect, incidental,
        or consequential damages arising from your use of the app.
      </Text>

      <Text style={s.heading}>Changes</Text>
      <Text style={s.paragraph}>
        We may update these terms from time to time. Continued use of the app after changes take
        effect means you accept the updated terms.
      </Text>

      <Text style={s.heading}>Contact Us</Text>
      <Text style={s.paragraph}>
        Questions about these terms can be sent to setlyhelp@outlook.com.
      </Text>
    </LegalDocScreen>
  );
}
