import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime

class ChessRegistrationForm:
    def __init__(self, root):
        self.root = root
        self.root.title("♟️ Chess Tournament Registration")
        self.root.geometry("650x750")
        self.root.configure(bg="#f5f7fa")
        
        # Color scheme
        self.colors = {
            'bg': '#f5f7fa',
            'card_bg': '#ffffff',
            'primary': '#2c3e50',
            'accent': '#3498db',
            'success': '#27ae60',
            'danger': '#e74c3c',
            'text': '#2c3e50',
            'text_light': '#7f8c8d',
            'border': '#e0e0e0',
            'hover_success': '#229954',
            'hover_danger': '#c0392b'
        }
        
        # Main container with padding
        main_container = tk.Frame(root, bg=self.colors['bg'])
        main_container.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
        
        # Header section with gradient effect
        header_frame = tk.Frame(main_container, bg=self.colors['primary'], height=100)
        header_frame.pack(fill=tk.X, pady=(0, 20))
        header_frame.pack_propagate(False)
        
        title_label = tk.Label(
            header_frame, 
            text="♟️ Chess Tournament Registration",
            font=("Helvetica", 24, "bold"),
            bg=self.colors['primary'],
            fg="white"
        )
        title_label.pack(pady=30)
        
        subtitle_label = tk.Label(
            header_frame,
            text="Join us for an exciting chess competition!",
            font=("Helvetica", 11),
            bg=self.colors['primary'],
            fg="#ecf0f1"
        )
        subtitle_label.pack(pady=(0, 10))
        
        # Card-style form container
        card_frame = tk.Frame(main_container, bg=self.colors['card_bg'], relief=tk.FLAT)
        card_frame.pack(fill=tk.BOTH, expand=True)
        
        # Scrollable canvas for form
        canvas = tk.Canvas(card_frame, bg=self.colors['card_bg'], highlightthickness=0)
        scrollbar = ttk.Scrollbar(card_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas, bg=self.colors['card_bg'])
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        # Form content with better spacing
        form_content = tk.Frame(scrollable_frame, bg=self.colors['card_bg'], padx=40, pady=30)
        form_content.pack(fill=tk.BOTH, expand=True)
        
        # Section: Personal Information
        self.create_section_header(form_content, "👤 Personal Information", 0)
        
        self.name_entry = self.create_field(form_content, "Full Name", "Enter your full name", 1, required=True)
        self.email_entry = self.create_field(form_content, "Email Address", "example@email.com", 2, required=True)
        self.phone_entry = self.create_field(form_content, "Phone Number", "+1 (555) 123-4567", 3, required=True)
        self.age_entry = self.create_field(form_content, "Age", "Enter your age", 4, required=True)
        
        # Section: Chess Details
        self.create_section_header(form_content, "♟️ Chess Details", 5)
        
        self.rating_entry = self.create_field(form_content, "Chess Rating (Optional)", "e.g., 1200, 1500, or leave blank if unrated", 6, required=False)
        
        # Experience Level with better styling
        exp_label = tk.Label(
            form_content,
            text="Experience Level *",
            font=("Helvetica", 11, "bold"),
            bg=self.colors['card_bg'],
            fg=self.colors['text'],
            anchor="w"
        )
        exp_label.grid(row=7, column=0, sticky="w", pady=(15, 8))
        
        self.experience_var = tk.StringVar(value="Beginner")
        experience_frame = tk.Frame(form_content, bg=self.colors['card_bg'])
        experience_frame.grid(row=7, column=1, sticky="w", pady=(15, 8))
        
        levels = [
            ("Beginner", "🌱"),
            ("Intermediate", "⭐"),
            ("Advanced", "🏆"),
            ("Expert", "👑")
        ]
        for level, icon in levels:
            rb = tk.Radiobutton(
                experience_frame,
                text=f"{icon} {level}",
                variable=self.experience_var,
                value=level,
                bg=self.colors['card_bg'],
                font=("Helvetica", 10),
                fg=self.colors['text'],
                selectcolor=self.colors['card_bg'],
                activebackground=self.colors['card_bg'],
                cursor="hand2",
                padx=10
            )
            rb.pack(side=tk.LEFT, padx=5)
        
        # Tournament Category
        cat_label = tk.Label(
            form_content,
            text="Tournament Category *",
            font=("Helvetica", 11, "bold"),
            bg=self.colors['card_bg'],
            fg=self.colors['text'],
            anchor="w"
        )
        cat_label.grid(row=8, column=0, sticky="w", pady=(15, 8))
        
        self.category_var = tk.StringVar()
        category_combo = ttk.Combobox(
            form_content,
            textvariable=self.category_var,
            values=["Open", "Under 18", "Under 16", "Under 14", "Senior (50+)", "Women's"],
            width=38,
            font=("Helvetica", 11),
            state="readonly"
        )
        category_combo.grid(row=8, column=1, sticky="w", pady=(15, 8))
        
        # Section: Additional Information
        self.create_section_header(form_content, "📋 Additional Information", 9)
        
        self.emergency_entry = self.create_field(form_content, "Emergency Contact (Optional)", "Name and phone number", 10, required=False)
        
        notes_label = tk.Label(
            form_content,
            text="Additional Notes",
            font=("Helvetica", 11, "bold"),
            bg=self.colors['card_bg'],
            fg=self.colors['text'],
            anchor="w"
        )
        notes_label.grid(row=11, column=0, sticky="nw", pady=(15, 8))
        
        notes_frame = tk.Frame(form_content, bg=self.colors['card_bg'])
        notes_frame.grid(row=11, column=1, sticky="w", pady=(15, 8))
        
        self.notes_text = tk.Text(
            notes_frame,
            width=42,
            height=5,
            font=("Helvetica", 10),
            wrap=tk.WORD,
            relief=tk.SOLID,
            borderwidth=1,
            bg="#fafafa",
            fg=self.colors['text']
        )
        self.notes_text.pack()
        self.notes_text.insert("1.0", "Any special requirements or notes...")
        self.notes_text.config(fg=self.colors['text_light'])
        self.notes_text.bind("<FocusIn>", self.on_notes_focus_in)
        self.notes_text.bind("<FocusOut>", self.on_notes_focus_out)
        
        # Buttons with improved styling
        button_frame = tk.Frame(main_container, bg=self.colors['bg'])
        button_frame.pack(pady=20)
        
        submit_btn = tk.Button(
            button_frame,
            text="✓ Submit Registration",
            command=self.submit_form,
            bg=self.colors['success'],
            fg="white",
            font=("Helvetica", 13, "bold"),
            padx=30,
            pady=12,
            cursor="hand2",
            relief=tk.FLAT,
            borderwidth=0,
            activebackground=self.colors['hover_success'],
            activeforeground="white"
        )
        submit_btn.pack(side=tk.LEFT, padx=10)
        submit_btn.bind("<Enter>", lambda e: submit_btn.config(bg=self.colors['hover_success']))
        submit_btn.bind("<Leave>", lambda e: submit_btn.config(bg=self.colors['success']))
        
        clear_btn = tk.Button(
            button_frame,
            text="↻ Clear Form",
            command=self.clear_form,
            bg=self.colors['danger'],
            fg="white",
            font=("Helvetica", 13, "bold"),
            padx=30,
            pady=12,
            cursor="hand2",
            relief=tk.FLAT,
            borderwidth=0,
            activebackground=self.colors['hover_danger'],
            activeforeground="white"
        )
        clear_btn.pack(side=tk.LEFT, padx=10)
        clear_btn.bind("<Enter>", lambda e: clear_btn.config(bg=self.colors['hover_danger']))
        clear_btn.bind("<Leave>", lambda e: clear_btn.config(bg=self.colors['danger']))
        
        # Pack canvas and scrollbar
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Enable mouse wheel scrolling
        def on_mousewheel(event):
            canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")
        
        canvas.bind_all("<MouseWheel>", on_mousewheel)
        
        # Configure grid weights for responsive layout
        form_content.columnconfigure(1, weight=1)
    
    def create_section_header(self, parent, text, row):
        """Create a styled section header"""
        header_frame = tk.Frame(parent, bg=self.colors['card_bg'], height=40)
        header_frame.grid(row=row, column=0, columnspan=2, sticky="ew", pady=(20, 10))
        
        header_label = tk.Label(
            header_frame,
            text=text,
            font=("Helvetica", 14, "bold"),
            bg=self.colors['card_bg'],
            fg=self.colors['primary']
        )
        header_label.pack(side=tk.LEFT)
        
        separator = tk.Frame(header_frame, height=2, bg=self.colors['accent'])
        separator.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=10)
    
    def create_field(self, parent, label_text, placeholder, row, required=False):
        """Create a styled form field with label and entry"""
        label = tk.Label(
            parent,
            text=f"{label_text}{' *' if required else ''}",
            font=("Helvetica", 11, "bold"),
            bg=self.colors['card_bg'],
            fg=self.colors['text'],
            anchor="w"
        )
        label.grid(row=row, column=0, sticky="w", pady=(15, 8))
        
        entry = tk.Entry(
            parent,
            width=42,
            font=("Helvetica", 11),
            relief=tk.SOLID,
            borderwidth=1,
            bg="#fafafa",
            fg=self.colors['text'],
            insertbackground=self.colors['accent']
        )
        entry.grid(row=row, column=1, sticky="w", pady=(15, 8))
        entry.insert(0, placeholder)
        entry.config(fg=self.colors['text_light'])
        entry.bind("<FocusIn>", lambda e, entry=entry, placeholder=placeholder: self.on_entry_focus_in(e, entry, placeholder))
        entry.bind("<FocusOut>", lambda e, entry=entry, placeholder=placeholder: self.on_entry_focus_out(e, entry, placeholder))
        
        return entry
    
    def on_entry_focus_in(self, event, entry, placeholder):
        """Handle entry focus in event"""
        if entry.get() == placeholder:
            entry.delete(0, tk.END)
            entry.config(fg=self.colors['text'])
    
    def on_entry_focus_out(self, event, entry, placeholder):
        """Handle entry focus out event"""
        if not entry.get():
            entry.insert(0, placeholder)
            entry.config(fg=self.colors['text_light'])
    
    def on_notes_focus_in(self, event):
        """Handle notes text focus in"""
        if self.notes_text.get("1.0", tk.END).strip() == "Any special requirements or notes...":
            self.notes_text.delete("1.0", tk.END)
            self.notes_text.config(fg=self.colors['text'])
    
    def on_notes_focus_out(self, event):
        """Handle notes text focus out"""
        if not self.notes_text.get("1.0", tk.END).strip():
            self.notes_text.insert("1.0", "Any special requirements or notes...")
            self.notes_text.config(fg=self.colors['text_light'])
    
    def get_entry_value(self, entry, placeholder):
        """Get entry value, returning empty if it's the placeholder"""
        value = entry.get().strip()
        return "" if value == placeholder else value
    
    def validate_form(self):
        """Validate that required fields are filled"""
        name = self.get_entry_value(self.name_entry, "Enter your full name")
        if not name:
            messagebox.showerror("Validation Error", "Please enter your full name.")
            self.name_entry.focus()
            return False
        
        email = self.get_entry_value(self.email_entry, "example@email.com")
        if not email:
            messagebox.showerror("Validation Error", "Please enter your email address.")
            self.email_entry.focus()
            return False
        if "@" not in email or "." not in email:
            messagebox.showerror("Validation Error", "Please enter a valid email address.")
            self.email_entry.focus()
            return False
        
        phone = self.get_entry_value(self.phone_entry, "+1 (555) 123-4567")
        if not phone:
            messagebox.showerror("Validation Error", "Please enter your phone number.")
            self.phone_entry.focus()
            return False
        
        age_str = self.get_entry_value(self.age_entry, "Enter your age")
        if not age_str:
            messagebox.showerror("Validation Error", "Please enter your age.")
            self.age_entry.focus()
            return False
        try:
            age = int(age_str)
            if age < 5 or age > 100:
                messagebox.showerror("Validation Error", "Please enter a valid age (5-100).")
                self.age_entry.focus()
                return False
        except ValueError:
            messagebox.showerror("Validation Error", "Age must be a number.")
            self.age_entry.focus()
            return False
        
        if not self.category_var.get():
            messagebox.showerror("Validation Error", "Please select a tournament category.")
            return False
        return True
    
    def submit_form(self):
        """Handle form submission"""
        if not self.validate_form():
            return
        
        # Collect form data
        rating = self.get_entry_value(self.rating_entry, "e.g., 1200, 1500, or leave blank if unrated")
        emergency = self.get_entry_value(self.emergency_entry, "Name and phone number")
        notes = self.notes_text.get("1.0", tk.END).strip()
        if notes == "Any special requirements or notes...":
            notes = ""
        
        registration_data = {
            "Name": self.get_entry_value(self.name_entry, "Enter your full name"),
            "Email": self.get_entry_value(self.email_entry, "example@email.com"),
            "Phone": self.get_entry_value(self.phone_entry, "+1 (555) 123-4567"),
            "Age": self.get_entry_value(self.age_entry, "Enter your age"),
            "Rating": rating or "Unrated",
            "Experience Level": self.experience_var.get(),
            "Category": self.category_var.get(),
            "Emergency Contact": emergency or "Not provided",
            "Notes": notes or "None",
            "Registration Date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Display confirmation with better formatting
        confirmation_message = "✓ Registration Successful!\n\n"
        confirmation_message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        confirmation_message += "REGISTRATION DETAILS\n"
        confirmation_message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        for key, value in registration_data.items():
            if key != "Registration Date":
                confirmation_message += f"  • {key}: {value}\n"
        confirmation_message += f"\n  • Registration Date: {registration_data['Registration Date']}\n"
        confirmation_message += "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        messagebox.showinfo("🎉 Registration Confirmed!", confirmation_message)
        
        # Save to file
        self.save_to_file(registration_data)
        
        # Optionally clear form after successful submission
        response = messagebox.askyesno("Clear Form", "Registration saved successfully! Would you like to clear the form for another registration?")
        if response:
            self.clear_form()
    
    def save_to_file(self, data):
        """Save registration data to a text file"""
        try:
            with open("chess_registrations.txt", "a", encoding="utf-8") as f:
                f.write("\n" + "=" * 50 + "\n")
                f.write(f"Registration Date: {data['Registration Date']}\n")
                f.write("-" * 50 + "\n")
                for key, value in data.items():
                    if key != "Registration Date":
                        f.write(f"{key}: {value}\n")
                f.write("=" * 50 + "\n")
            messagebox.showinfo("File Saved", "Registration data has been saved to chess_registrations.txt")
        except Exception as e:
            messagebox.showerror("Error", f"Could not save to file: {str(e)}")
    
    def clear_form(self):
        """Clear all form fields and restore placeholders"""
        # Clear and restore placeholders for entry fields
        self.name_entry.delete(0, tk.END)
        self.name_entry.insert(0, "Enter your full name")
        self.name_entry.config(fg=self.colors['text_light'])
        
        self.email_entry.delete(0, tk.END)
        self.email_entry.insert(0, "example@email.com")
        self.email_entry.config(fg=self.colors['text_light'])
        
        self.phone_entry.delete(0, tk.END)
        self.phone_entry.insert(0, "+1 (555) 123-4567")
        self.phone_entry.config(fg=self.colors['text_light'])
        
        self.age_entry.delete(0, tk.END)
        self.age_entry.insert(0, "Enter your age")
        self.age_entry.config(fg=self.colors['text_light'])
        
        self.rating_entry.delete(0, tk.END)
        self.rating_entry.insert(0, "e.g., 1200, 1500, or leave blank if unrated")
        self.rating_entry.config(fg=self.colors['text_light'])
        
        self.emergency_entry.delete(0, tk.END)
        self.emergency_entry.insert(0, "Name and phone number")
        self.emergency_entry.config(fg=self.colors['text_light'])
        
        # Reset other fields
        self.experience_var.set("Beginner")
        self.category_var.set("")
        
        # Clear notes
        self.notes_text.delete("1.0", tk.END)
        self.notes_text.insert("1.0", "Any special requirements or notes...")
        self.notes_text.config(fg=self.colors['text_light'])
        
        # Focus on first field
        self.name_entry.focus()

def main():
    root = tk.Tk()
    app = ChessRegistrationForm(root)
    root.mainloop()

if __name__ == "__main__":
    main()

